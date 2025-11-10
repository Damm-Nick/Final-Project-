USE sports_management;

SELECT 'Query 1: Top 5 Active Players by Performance with Team Details' AS '';
SELECT 
    p.id,
    p.name,
    p.age,
    p.sport,
    p.matches_played,
    p.runs_scored,
    t.name AS team_name,
    t.coach,
    ROUND(p.runs_scored / p.matches_played, 2) AS avg_per_match
FROM players p
INNER JOIN teams t ON p.team_id = t.id
WHERE p.status = 'active' AND p.matches_played > 0
ORDER BY p.runs_scored DESC
LIMIT 5;

SELECT 'Query 2: Team Statistics with Player Aggregation' AS '';
SELECT 
    t.id,
    t.name AS team_name,
    t.sport,
    t.coach,
    t.total_players,
    t.wins,
    COUNT(p.id) AS actual_player_count,
    ROUND(AVG(p.age), 2) AS avg_age,
    SUM(p.runs_scored) AS total_runs,
    SUM(p.matches_played) AS total_matches,
    ROUND(SUM(p.runs_scored) / NULLIF(SUM(p.matches_played), 0), 2) AS team_avg_performance
FROM teams t
LEFT JOIN players p ON t.id = p.team_id
GROUP BY t.id, t.name, t.sport, t.coach, t.total_players, t.wins
HAVING COUNT(p.id) > 0
ORDER BY total_runs DESC;

SELECT 'Query 3: Event Progress with Match Statistics' AS '';
SELECT 
    e.id,
    e.name AS event_name,
    e.sport,
    e.start_date,
    e.end_date,
    e.status,
    COUNT(m.id) AS total_matches,
    SUM(CASE WHEN m.status = 'completed' THEN 1 ELSE 0 END) AS completed_matches,
    SUM(CASE WHEN m.status = 'ongoing' THEN 1 ELSE 0 END) AS ongoing_matches,
    SUM(CASE WHEN m.status = 'scheduled' THEN 1 ELSE 0 END) AS scheduled_matches,
    ROUND((SUM(CASE WHEN m.status = 'completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(m.id)), 2) AS completion_percentage
FROM events e
LEFT JOIN matches m ON e.id = m.event_id
GROUP BY e.id, e.name, e.sport, e.start_date, e.end_date, e.status
ORDER BY e.start_date DESC;

SELECT 'Query 4: Detailed Match Results with Multiple Joins' AS '';
SELECT 
    m.id AS match_id,
    e.name AS event_name,
    m.match_date,
    m.location,
    t1.name AS team1_name,
    t2.name AS team2_name,
    m.team1_score,
    m.team2_score,
    CASE 
        WHEN m.winner_id IS NOT NULL THEN tw.name
        ELSE 'TBD'
    END AS winner,
    ABS(m.team1_score - m.team2_score) AS score_difference,
    m.status,
    DATEDIFF(CURDATE(), m.match_date) AS days_since_match
FROM matches m
JOIN events e ON m.event_id = e.id
JOIN teams t1 ON m.team1_id = t1.id
JOIN teams t2 ON m.team2_id = t2.id
LEFT JOIN teams tw ON m.winner_id = tw.id
WHERE m.status = 'completed'
ORDER BY score_difference DESC;

SELECT 'Query 5: Players Grouped by Team with String Aggregation' AS '';
SELECT 
    t.id,
    t.name AS team_name,
    t.sport,
    t.total_players,
    GROUP_CONCAT(
        CONCAT(p.name, ' (Age: ', p.age, ', Status: ', p.status, ')')
        ORDER BY p.runs_scored DESC
        SEPARATOR ' | '
    ) AS players_list,
    COUNT(p.id) AS active_player_count
FROM teams t
LEFT JOIN players p ON t.id = p.team_id
GROUP BY t.id, t.name, t.sport, t.total_players
ORDER BY t.sport, t.name;

SELECT 'Query 6: Upcoming Matches with Team and Event Details' AS '';
SELECT 
    m.id,
    m.match_date,
    e.name AS event_name,
    e.location AS event_location,
    CONCAT(t1.name, ' vs ', t2.name) AS matchup,
    m.location AS match_venue,
    CONCAT(t1.coach, ' (', t1.name, ')') AS team1_coach,
    CONCAT(t2.coach, ' (', t2.name, ')') AS team2_coach,
    DATEDIFF(m.match_date, CURDATE()) AS days_until_match
FROM matches m
JOIN events e ON m.event_id = e.id
JOIN teams t1 ON m.team1_id = t1.id
JOIN teams t2 ON m.team2_id = t2.id
WHERE m.status IN ('scheduled', 'ongoing')
ORDER BY m.match_date ASC;

SELECT 'Query 7: Player Performance in Matches with Subquery' AS '';
SELECT 
    p.name AS player_name,
    p.sport,
    t.name AS team_name,
    pms.runs_scored AS match_runs,
    pms.wickets_taken,
    m.match_date,
    CONCAT(t1.name, ' vs ', t2.name) AS match_details,
    e.name AS event_name
FROM player_match_stats pms
JOIN players p ON pms.player_id = p.id
JOIN teams t ON p.team_id = t.id
JOIN matches m ON pms.match_id = m.id
JOIN events e ON m.event_id = e.id
JOIN teams t1 ON m.team1_id = t1.id
JOIN teams t2 ON m.team2_id = t2.id
WHERE pms.runs_scored > (
    SELECT AVG(runs_scored) 
    FROM player_match_stats
)
ORDER BY pms.runs_scored DESC;

SELECT 'Query 8: Teams Win Percentage and Ranking' AS '';
SELECT 
    t.id,
    t.name AS team_name,
    t.sport,
    t.wins AS total_wins,
    COUNT(m.id) AS total_matches_played,
    SUM(CASE WHEN m.winner_id = t.id THEN 1 ELSE 0 END) AS matches_won,
    ROUND((SUM(CASE WHEN m.winner_id = t.id THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(m.id), 0)), 2) AS win_percentage,
    RANK() OVER (PARTITION BY t.sport ORDER BY t.wins DESC) AS sport_rank
FROM teams t
LEFT JOIN matches m ON t.id = m.team1_id OR t.id = m.team2_id
WHERE m.status = 'completed' OR m.id IS NULL
GROUP BY t.id, t.name, t.sport, t.wins
ORDER BY t.sport, t.wins DESC;

SELECT 'Query 9: Events with Match Count and Most Winning Team' AS '';
SELECT 
    e.id,
    e.name AS event_name,
    e.sport,
    e.status,
    COUNT(DISTINCT m.id) AS total_matches,
    (SELECT t.name 
     FROM teams t
     JOIN matches m2 ON m2.winner_id = t.id
     WHERE m2.event_id = e.id
     GROUP BY t.id, t.name
     ORDER BY COUNT(m2.id) DESC
     LIMIT 1
    ) AS most_winning_team,
    (SELECT COUNT(*)
     FROM matches m3
     WHERE m3.event_id = e.id AND m3.winner_id = (
         SELECT m4.winner_id
         FROM matches m4
         WHERE m4.event_id = e.id AND m4.winner_id IS NOT NULL
         GROUP BY m4.winner_id
         ORDER BY COUNT(*) DESC
         LIMIT 1
     )
    ) AS max_wins_in_event
FROM events e
LEFT JOIN matches m ON e.id = m.event_id
GROUP BY e.id, e.name, e.sport, e.status
ORDER BY e.start_date DESC;

SELECT 'Query 10: Player Status Distribution by Sport' AS '';
SELECT 
    sport,
    status,
    COUNT(*) AS player_count,
    ROUND(AVG(age), 2) AS avg_age,
    ROUND(AVG(matches_played), 2) AS avg_matches,
    ROUND(AVG(runs_scored), 2) AS avg_score,
    MIN(age) AS youngest,
    MAX(age) AS oldest
FROM players
GROUP BY sport, status
WITH ROLLUP
ORDER BY sport, status;