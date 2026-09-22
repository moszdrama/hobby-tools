/**
 * TCX Strava Sync Fixer Engine
 * Core processing logic adapted for browser and Node.js environments.
 * Repairs smartwatch TCX files where GPS buffer lag/irregular sampling
 * causes Strava to miscalculate moving time and pace.
 */

(function (global) {
    'use strict';

    function haversine(lat1, lon1, lat2, lon2) {
        const R = 6371000; // meters
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function formatOffsetDate(date, offsetStr) {
        if (!offsetStr || offsetStr === 'Z') {
            return date.toISOString();
        }
        const match = /([+-])(\d{2}):(\d{2})/.exec(offsetStr);
        if (!match) return date.toISOString();

        const sign = match[1] === '+' ? 1 : -1;
        const hours = parseInt(match[2], 10);
        const mins = parseInt(match[3], 10);
        const totalOffsetMs = sign * (hours * 60 + mins) * 60 * 1000;

        const localTime = new Date(date.getTime() + totalOffsetMs);
        const y = localTime.getUTCFullYear();
        const m = String(localTime.getUTCMonth() + 1).padStart(2, '0');
        const d = String(localTime.getUTCDate()).padStart(2, '0');
        const hh = String(localTime.getUTCHours()).padStart(2, '0');
        const mm = String(localTime.getUTCMinutes()).padStart(2, '0');
        const ss = String(localTime.getUTCSeconds()).padStart(2, '0');
        const ms = String(localTime.getUTCMilliseconds()).padStart(3, '0');

        return `${y}-${m}-${d}T${hh}:${mm}:${ss}.${ms}${offsetStr}`;
    }

    function calcStats(points, movingThreshold = 0.8) {
        if (!points || points.length === 0) return null;
        const startTime = points[0].time;
        const endTime = points[points.length - 1].time;
        const totalSecs = Math.max(0, (endTime - startTime) / 1000);

        let movingSecs = 0;
        let gpsDist = 0;

        for (let i = 1; i < points.length; i++) {
            const dt = (points[i].time - points[i - 1].time) / 1000;
            if (dt <= 0) continue;
            const dGps = haversine(points[i - 1].lat, points[i - 1].lon, points[i].lat, points[i].lon);
            gpsDist += dGps;
            const spd = dGps / dt;
            if (spd > movingThreshold) {
                movingSecs += dt;
            }
        }

        const recordedDist = (points[points.length - 1].dist !== null && points[points.length - 1].dist !== undefined)
            ? points[points.length - 1].dist
            : gpsDist;

        const avgPaceSec = recordedDist > 0 && movingSecs > 0 ? (movingSecs / recordedDist) * 1000 : 0;
        const pMin = Math.floor(avgPaceSec / 60);
        const pSec = Math.floor(avgPaceSec % 60);

        const avgSpeedKmh = movingSecs > 0 ? (recordedDist / 1000) / (movingSecs / 3600) : 0;

        return {
            totalSecs,
            totalTimeFormatted: `${Math.floor(totalSecs / 60)}:${Math.floor(totalSecs % 60).toString().padStart(2, '0')}`,
            movingSecs,
            movingTimeFormatted: `${Math.floor(movingSecs / 60)}:${Math.floor(movingSecs % 60).toString().padStart(2, '0')}`,
            recordedDistMeters: recordedDist,
            recordedDistKm: (recordedDist / 1000).toFixed(2),
            paceSec: avgPaceSec,
            paceFormatted: avgPaceSec > 0 ? `${pMin}:${pSec.toString().padStart(2, '0')}/km` : '--:--/km',
            avgSpeedKmh: avgSpeedKmh.toFixed(2),
            pointCount: points.length
        };
    }

    function parseTcx(xmlString) {
        // Detect timezone offset from first timestamp
        const tzMatch = /<Time>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?([+-]\d{2}:\d{2}|Z)<\/Time>/.exec(xmlString);
        const timeOffset = tzMatch ? tzMatch[1] : 'Z';

        // Parse all trackpoints using regex (clean & handles large XML without DOM overhead)
        const tpRegex = /<Trackpoint>([\s\S]*?)<\/Trackpoint>/g;
        const points = [];
        let match;

        while ((match = tpRegex.exec(xmlString)) !== null) {
            const block = match[1];
            const timeMatch = /<Time>(.*?)<\/Time>/.exec(block);
            const distMatch = /<DistanceMeters>(.*?)<\/DistanceMeters>/.exec(block);
            const latMatch = /<LatitudeDegrees>(.*?)<\/LatitudeDegrees>/.exec(block);
            const lonMatch = /<LongitudeDegrees>(.*?)<\/LongitudeDegrees>/.exec(block);
            const altMatch = /<AltitudeMeters>(.*?)<\/AltitudeMeters>/.exec(block);
            const hrMatch = /<HeartRateBpm>\s*<Value>(.*?)<\/Value>/.exec(block);
            const cadMatch = /<Cadence>(.*?)<\/Cadence>/.exec(block);

            if (!timeMatch || !latMatch || !lonMatch) continue;

            points.push({
                time: new Date(timeMatch[1]),
                dist: distMatch ? parseFloat(distMatch[1]) : null,
                lat: parseFloat(latMatch[1]),
                lon: parseFloat(lonMatch[1]),
                alt: altMatch ? parseFloat(altMatch[1]) : null,
                hr: hrMatch ? parseInt(hrMatch[1], 10) : null,
                cadence: cadMatch ? parseInt(cadMatch[1], 10) : null
            });
        }

        return {
            points,
            timeOffset
        };
    }

    function processTcx(xmlString, userOptions = {}) {
        const options = {
            window: userOptions.window !== undefined ? parseInt(userOptions.window, 10) : 7,
            minStopDuration: userOptions.minStopDuration !== undefined ? parseInt(userOptions.minStopDuration, 10) : 15,
            movingThreshold: userOptions.movingThreshold !== undefined ? parseFloat(userOptions.movingThreshold) : 0.8
        };

        const { points, timeOffset } = parseTcx(xmlString);

        if (!points || points.length < 2) {
            throw new Error('ไฟล์ TCX มีจุดพิกัดไม่เพียงพอ (ต้องการอย่างน้อย 2 จุด)');
        }

        const origStats = calcStats(points, options.movingThreshold);

        // Count gaps > 2s
        let gapCount = 0;
        let totalGapSecs = 0;
        for (let i = 1; i < points.length; i++) {
            const dt = (points[i].time - points[i - 1].time) / 1000;
            if (dt > 2) {
                gapCount++;
                totalGapSecs += dt;
            }
        }

        // Resample points to uniform 1-second grid
        const startTimeMs = points[0].time.getTime();
        const endTimeMs = points[points.length - 1].time.getTime();
        const totalSeconds = Math.round((endTimeMs - startTimeMs) / 1000);

        const resampled = [];
        let origIdx = 0;

        for (let s = 0; s <= totalSeconds; s++) {
            const targetTime = startTimeMs + s * 1000;
            while (origIdx < points.length - 1 && points[origIdx + 1].time.getTime() <= targetTime) {
                origIdx++;
            }

            if (origIdx >= points.length - 1) {
                const last = points[points.length - 1];
                resampled.push({
                    time: new Date(targetTime),
                    lat: last.lat,
                    lon: last.lon,
                    alt: last.alt,
                    dist: last.dist,
                    hr: last.hr,
                    cadence: last.cadence
                });
            } else {
                const p1 = points[origIdx];
                const p2 = points[origIdx + 1];
                const t1 = p1.time.getTime();
                const t2 = p2.time.getTime();
                const ratio = t2 > t1 ? (targetTime - t1) / (t2 - t1) : 0;

                resampled.push({
                    time: new Date(targetTime),
                    lat: p1.lat + (p2.lat - p1.lat) * ratio,
                    lon: p1.lon + (p2.lon - p1.lon) * ratio,
                    alt: p1.alt !== null && p2.alt !== null ? p1.alt + (p2.alt - p1.alt) * ratio : (p1.alt ?? p2.alt),
                    dist: p1.dist !== null && p2.dist !== null ? p1.dist + (p2.dist - p1.dist) * ratio : (p1.dist ?? p2.dist),
                    hr: p1.hr !== null && p2.hr !== null ? Math.round(p1.hr + (p2.hr - p1.hr) * ratio) : (p1.hr ?? p2.hr),
                    cadence: p1.cadence !== null && p2.cadence !== null ? Math.round(p1.cadence + (p2.cadence - p1.cadence) * ratio) : (p1.cadence ?? p2.cadence)
                });
            }
        }

        // Identify genuine stops in original points (gap >= minStopDuration with dd < 5m)
        const genuineStops = [];
        for (let i = 1; i < points.length; i++) {
            const dt = (points[i].time - points[i - 1].time) / 1000;
            const dd = (points[i].dist || 0) - (points[i - 1].dist || 0);
            if (dt >= options.minStopDuration && dd < 5) {
                genuineStops.push({
                    fromMs: points[i - 1].time.getTime(),
                    toMs: points[i].time.getTime(),
                    duration: dt,
                    lat: points[i - 1].lat,
                    lon: points[i - 1].lon
                });
            }
        }

        // Rolling window smoothing
        const windowSecs = options.window;
        const halfWin = Math.floor(windowSecs / 2);
        const smoothed = [];

        for (let i = 0; i < resampled.length; i++) {
            const curMs = resampled[i].time.getTime();
            const isInGenuineStop = genuineStops.some(s => curMs >= s.fromMs && curMs <= s.toMs);

            if (isInGenuineStop) {
                smoothed.push({ ...resampled[i] });
                continue;
            }

            let startW = Math.max(0, i - halfWin);
            let endW = Math.min(resampled.length - 1, i + halfWin);
            let sumLat = 0, sumLon = 0, sumAlt = 0, sumDist = 0, count = 0;

            for (let j = startW; j <= endW; j++) {
                sumLat += resampled[j].lat;
                sumLon += resampled[j].lon;
                sumAlt += resampled[j].alt || 0;
                sumDist += resampled[j].dist || 0;
                count++;
            }

            smoothed.push({
                time: resampled[i].time,
                lat: sumLat / count,
                lon: sumLon / count,
                alt: sumAlt / count,
                dist: sumDist / count,
                hr: resampled[i].hr,
                cadence: resampled[i].cadence
            });
        }

        // Anchor first and last coordinates and align start distance
        if (smoothed.length > 0) {
            smoothed[0].lat = points[0].lat;
            smoothed[0].lon = points[0].lon;
            smoothed[0].alt = points[0].alt;
            smoothed[smoothed.length - 1].lat = points[points.length - 1].lat;
            smoothed[smoothed.length - 1].lon = points[points.length - 1].lon;
            smoothed[smoothed.length - 1].alt = points[points.length - 1].alt;

            const origStartDist = points[0].dist ?? 0;
            const curStartDist = smoothed[0].dist ?? 0;
            const distOffset = curStartDist - origStartDist;

            for (let i = 0; i < smoothed.length; i++) {
                if (smoothed[i].dist !== null) {
                    smoothed[i].dist = Math.max(0, smoothed[i].dist - distOffset);
                }
            }
            smoothed[0].dist = origStartDist;
        }

        // Scale final distance to match original total distance
        const targetTotalDist = points[points.length - 1].dist;
        const currentEndDist = smoothed[smoothed.length - 1].dist;
        if (targetTotalDist && currentEndDist && currentEndDist > 0) {
            const scale = targetTotalDist / currentEndDist;
            for (let i = 0; i < smoothed.length; i++) {
                if (smoothed[i].dist !== null) {
                    smoothed[i].dist *= scale;
                }
            }
            smoothed[smoothed.length - 1].dist = targetTotalDist;
        }

        const newStats = calcStats(smoothed, options.movingThreshold);

        // Build new Trackpoints XML
        let trackpointsXml = '';
        for (let i = 0; i < smoothed.length; i++) {
            const pt = smoothed[i];
            const timeStr = formatOffsetDate(pt.time, timeOffset);

            trackpointsXml += `                    <Trackpoint>\n`;
            trackpointsXml += `                        <Time>${timeStr}</Time>\n`;
            trackpointsXml += `                        <Position>\n`;
            trackpointsXml += `                            <LatitudeDegrees>${pt.lat.toFixed(14)}</LatitudeDegrees>\n`;
            trackpointsXml += `                            <LongitudeDegrees>${pt.lon.toFixed(14)}</LongitudeDegrees>\n`;
            trackpointsXml += `                        </Position>\n`;
            if (pt.alt !== null && !isNaN(pt.alt)) {
                trackpointsXml += `                        <AltitudeMeters>${pt.alt.toFixed(3)}</AltitudeMeters>\n`;
            }
            if (pt.dist !== null && !isNaN(pt.dist)) {
                trackpointsXml += `                        <DistanceMeters>${pt.dist.toFixed(3)}</DistanceMeters>\n`;
            }
            if (pt.hr !== null && !isNaN(pt.hr)) {
                trackpointsXml += `                        <HeartRateBpm>\n`;
                trackpointsXml += `                            <Value>${pt.hr}</Value>\n`;
                trackpointsXml += `                        </HeartRateBpm>\n`;
            }
            if (pt.cadence !== null && !isNaN(pt.cadence)) {
                trackpointsXml += `                        <Cadence>${pt.cadence}</Cadence>\n`;
            }
            trackpointsXml += `                    </Trackpoint>\n`;
        }

        // Replace <Track>...</Track> block in original XML
        const fixedXml = xmlString.replace(/<Track>[\s\S]*?<\/Track>/, `<Track>\n${trackpointsXml}                </Track>`);

        // Calculate regained time
        const regainedSecs = Math.max(0, newStats.movingSecs - origStats.movingSecs);
        const regainedFormatted = `${Math.floor(regainedSecs / 60)}:${Math.floor(regainedSecs % 60).toString().padStart(2, '0')}`;

        return {
            origPoints: points,
            smoothedPoints: smoothed,
            genuineStops,
            origStats,
            newStats,
            gapCount,
            totalGapSecs,
            regainedSecs,
            regainedFormatted,
            fixedXml,
            timeOffset,
            options
        };
    }

    const TcxEngine = {
        haversine,
        formatOffsetDate,
        calcStats,
        parseTcx,
        processTcx
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = TcxEngine;
    } else {
        global.TcxEngine = TcxEngine;
    }

})(typeof window !== 'undefined' ? window : this);
