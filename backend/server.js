const express = require('express')
const mysql = require('mysql2/promise')
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.json())
const dbConfig = { host: 'localhost', user: 'root', password: 'root', database: 'sports_management', port: 3306 }
let pool
async function initDB() {
    pool = mysql.createPool(dbConfig)
    const connection = await pool.getConnection()
    connection.release()
}
app.get('/api/test', (req, res) => { res.json({ message: 'Backend is working!' }) })
app.get('/api/players', async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT p.*, t.name as team_name FROM players p LEFT JOIN teams t ON p.team_id = t.id ORDER BY p.id DESC`)
        res.json(rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})
app.get('/api/players/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM players WHERE id = ?', [req.params.id])
        res.json(rows[0] || null)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})
app.post('/api/players', async (req, res) => {
    try {
        const { name, age, sport, team_id, status } = req.body
        const [result] = await pool.query('INSERT INTO players (name, age, sport, team_id, status) VALUES (?, ?, ?, ?, ?)', [name, age, sport, team_id, status || 'active'])
        res.json({ id: result.insertId, message: 'Player added successfully' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})
app.put('/api/players/:id', async (req, res) => {
    try {
        const { name, age, sport, team_id, matches_played, runs_scored, status } = req.body
        await pool.query('UPDATE players SET name=?, age=?, sport=?, team_id=?, matches_played=?, runs_scored=?, status=? WHERE id=?', [name, age, sport, team_id, matches_played, runs_scored, status, req.params.id])
        res.json({ message: 'Player updated successfully' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})
app.delete('/api/players/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM players WHERE id = ?', [req.params.id])
        res.json({ message: 'Player deleted successfully' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})
app.get('/api/teams', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM teams ORDER BY id DESC')
        res.json(rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})
app.post('/api/teams', async (req, res) => {
    try {
        const { name, sport, coach, founded } = req.body
        const [result] = await pool.query('INSERT INTO teams (name, sport, coach, founded) VALUES (?, ?, ?, ?)', [name, sport, coach, founded])
        res.json({ id: result.insertId, message: 'Team added successfully' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})
app.get('/api/events', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM events ORDER BY start_date DESC')
        res.json(rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})
app.post('/api/events', async (req, res) => {
    try {
        const { name, sport, start_date, end_date, location, total_teams } = req.body
        const [result] = await pool.query('INSERT INTO events (name, sport, start_date, end_date, location, total_teams) VALUES (?, ?, ?, ?, ?, ?)', [name, sport, start_date, end_date, location, total_teams])
        res.json({ id: result.insertId, message: 'Event added successfully' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})
app.get('/api/matches', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT m.*, e.name as event_name, t1.name as team1_name, t2.name as team2_name, tw.name as winner_name
            FROM matches m
            LEFT JOIN events e ON m.event_id = e.id
            LEFT JOIN teams t1 ON m.team1_id = t1.id
            LEFT JOIN teams t2 ON m.team2_id = t2.id
            LEFT JOIN teams tw ON m.winner_id = tw.id
            ORDER BY m.match_date DESC
        `)
        res.json(rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})
app.post('/api/matches', async (req, res) => {
    try {
        const { event_id, team1_id, team2_id, match_date, location } = req.body
        const [result] = await pool.query('INSERT INTO matches (event_id, team1_id, team2_id, match_date, location) VALUES (?, ?, ?, ?, ?)', [event_id, team1_id, team2_id, match_date, location])
        res.json({ id: result.insertId, message: 'Match added successfully' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})
app.put('/api/matches/:id', async (req, res) => {
    try {
        const { status, team1_score, team2_score, winner_id } = req.body
        await pool.query('UPDATE matches SET status=?, team1_score=?, team2_score=?, winner_id=? WHERE id=?', [status, team1_score, team2_score, winner_id, req.params.id])
        res.json({ message: 'Match updated successfully' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})
app.get('/api/stats', async (req, res) => {
    try {
        const [playerCount] = await pool.query('SELECT COUNT(*) as count FROM players')
        const [teamCount] = await pool.query('SELECT COUNT(*) as count FROM teams')
        const [eventCount] = await pool.query('SELECT COUNT(*) as count FROM events')
        const [matchCount] = await pool.query('SELECT COUNT(*) as count FROM matches')
        res.json({ players: playerCount[0].count, teams: teamCount[0].count, events: eventCount[0].count, matches: matchCount[0].count })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})
app.get('/api/queries/top-players', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.id, p.name, p.age, p.sport, p.matches_played, p.runs_scored, t.name AS team_name, t.coach, ROUND(p.runs_scored / NULLIF(p.matches_played, 0), 2) AS avg_per_match
            FROM players p
            INNER JOIN teams t ON p.team_id = t.id
            WHERE p.status = 'active' AND p.matches_played > 0
            ORDER BY p.runs_scored DESC
            LIMIT 5
        `)
        res.json(rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})
app.get('/api/queries/team-stats', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT t.id, t.name AS team_name, t.sport, t.coach, t.total_players, t.wins,
                   COUNT(p.id) AS actual_player_count,
                   ROUND(AVG(p.age), 2) AS avg_age,
                   SUM(p.runs_scored) AS total_runs,
                   SUM(p.matches_played) AS total_matches
            FROM teams t
            LEFT JOIN players p ON t.id = p.team_id
            GROUP BY t.id, t.name, t.sport, t.coach, t.total_players, t.wins
            HAVING COUNT(p.id) > 0
            ORDER BY total_runs DESC
        `)
        res.json(rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})
app.get('/api/queries/event-progress', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT e.id, e.name AS event_name, e.sport, e.start_date, e.end_date, e.status,
                   COUNT(m.id) AS total_matches,
                   SUM(CASE WHEN m.status = 'completed' THEN 1 ELSE 0 END) AS completed_matches,
                   SUM(CASE WHEN m.status = 'ongoing' THEN 1 ELSE 0 END) AS ongoing_matches,
                   SUM(CASE WHEN m.status = 'scheduled' THEN 1 ELSE 0 END) AS scheduled_matches,
                   ROUND((SUM(CASE WHEN m.status = 'completed' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(m.id), 0)), 2) AS completion_percentage
            FROM events e
            LEFT JOIN matches m ON e.id = m.event_id
            GROUP BY e.id, e.name, e.sport, e.start_date, e.end_date, e.status
            ORDER BY e.start_date DESC
        `)
        res.json(rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})
app.get('/api/queries/recent-matches', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT m.id AS match_id, e.name AS event_name, m.match_date, m.location,
                   t1.name AS team1_name, t2.name AS team2_name,
                   m.team1_score, m.team2_score,
                   CASE WHEN m.winner_id IS NOT NULL THEN tw.name ELSE 'TBD' END AS winner,
                   m.status
            FROM matches m
            JOIN events e ON m.event_id = e.id
            JOIN teams t1 ON m.team1_id = t1.id
            JOIN teams t2 ON m.team2_id = t2.id
            LEFT JOIN teams tw ON m.winner_id = tw.id
            ORDER BY m.match_date DESC
            LIMIT 10
        `)
        res.json(rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})
app.get('/api/logs', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT ml.*, m.match_date,
                   CONCAT(t1.name, ' vs ', t2.name) AS match_info
            FROM match_logs ml
            JOIN matches m ON ml.match_id = m.id
            JOIN teams t1 ON m.team1_id = t1.id
            JOIN teams t2 ON m.team2_id = t2.id
            ORDER BY ml.timestamp DESC
            LIMIT 50
        `)
        res.json(rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})
app.get('/api/queries/q1', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.id, p.name, p.age, p.sport, p.matches_played, p.runs_scored, t.name AS team_name, t.coach, ROUND(p.runs_scored / NULLIF(p.matches_played, 0), 2) AS avg_per_match
            FROM players p
            INNER JOIN teams t ON p.team_id = t.id
            WHERE p.status = 'active' AND p.matches_played > 0
            ORDER BY p.runs_scored DESC
            LIMIT 5
        `)
        res.json(rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})
app.get('/api/queries/q2', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT t.id, t.name AS team_name, t.sport, t.coach, t.total_players, t.wins,
                   COUNT(p.id) AS actual_player_count,
                   ROUND(AVG(p.age), 2) AS avg_age,
                   SUM(p.runs_scored) AS total_runs,
                   SUM(p.matches_played) AS total_matches,
                   ROUND(SUM(p.runs_scored) / NULLIF(SUM(p.matches_played), 0), 2) AS team_avg_performance
            FROM teams t
            LEFT JOIN players p ON t.id = p.team_id
            GROUP BY t.id, t.name, t.sport, t.coach, t.total_players, t.wins
            HAVING COUNT(p.id) > 0
            ORDER BY total_runs DESC
        `)
        res.json(rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})
app.get('/api/queries/q3', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT e.id, e.name AS event_name, e.sport, e.start_date, e.end_date, e.status,
                   COUNT(m.id) AS total_matches,
                   SUM(CASE WHEN m.status = 'completed' THEN 1 ELSE 0 END) AS completed_matches,
                   SUM(CASE WHEN m.status = 'ongoing' THEN 1 ELSE 0 END) AS ongoing_matches,
                   SUM(CASE WHEN m.status = 'scheduled' THEN 1 ELSE 0 END) AS scheduled_matches,
                   ROUND((SUM(CASE WHEN m.status = 'completed' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(m.id), 0)), 2) AS completion_percentage
            FROM events e
            LEFT JOIN matches m ON e.id = m.event_id
            GROUP BY e.id, e.name, e.sport, e.start_date, e.end_date, e.status
            ORDER BY e.start_date DESC
        `)
        res.json(rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})
app.get('/api/queries/q4', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT m.id AS match_id, e.name AS event_name, m.match_date, m.location, t1.name AS team1_name, t2.name AS team2_name, m.team1_score, m.team2_score,
                   CASE WHEN m.winner_id IS NOT NULL THEN tw.name ELSE 'TBD' END AS winner,
                   ABS(m.team1_score - m.team2_score) AS score_difference,
                   m.status,
                   DATEDIFF(CURDATE(), m.match_date) AS days_since_match
            FROM matches m
            JOIN events e ON m.event_id = e.id
            JOIN teams t1 ON m.team1_id = t1.id
            JOIN teams t2 ON m.team2_id = t2.id
            LEFT JOIN teams tw ON m.winner_id = tw.id
            WHERE m.status = 'completed'
            ORDER BY score_difference DESC
        `)
        res.json(rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})
app.get('/api/queries/q5', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT t.id, t.name AS team_name, t.sport, t.total_players,
                   GROUP_CONCAT(CONCAT(p.name, ' (Age: ', p.age, ', Status: ', p.status, ')') ORDER BY p.runs_scored DESC SEPARATOR ' | ') AS players_list,
                   COUNT(p.id) AS active_player_count
            FROM teams t
            LEFT JOIN players p ON t.id = p.team_id
            GROUP BY t.id, t.name, t.sport, t.total_players
            ORDER BY t.sport, t.name
        `)
        res.json(rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})
app.get('/api/queries/q6', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT m.id, m.match_date, e.name AS event_name, e.location AS event_location, CONCAT(t1.name, ' vs ', t2.name) AS matchup, m.location AS match_venue,
                   CONCAT(t1.coach, ' (', t1.name, ')') AS team1_coach, CONCAT(t2.coach, ' (', t2.name, ')') AS team2_coach,
                   DATEDIFF(m.match_date, CURDATE()) AS days_until_match
            FROM matches m
            JOIN events e ON m.event_id = e.id
            JOIN teams t1 ON m.team1_id = t1.id
            JOIN teams t2 ON m.team2_id = t2.id
            WHERE m.status IN ('scheduled', 'ongoing')
            ORDER BY m.match_date ASC
        `)
        res.json(rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})
app.get('/api/queries/q7', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.name AS player_name, p.sport, t.name AS team_name, pms.runs_scored AS match_runs, pms.wickets_taken, m.match_date,
                   CONCAT(t1.name, ' vs ', t2.name) AS match_details, e.name AS event_name
            FROM player_match_stats pms
            JOIN players p ON pms.player_id = p.id
            JOIN teams t ON p.team_id = t.id
            JOIN matches m ON pms.match_id = m.id
            JOIN events e ON m.event_id = e.id
            JOIN teams t1 ON m.team1_id = t1.id
            JOIN teams t2 ON m.team2_id = t2.id
            WHERE pms.runs_scored > (SELECT AVG(runs_scored) FROM player_match_stats)
            ORDER BY pms.runs_scored DESC
        `)
        res.json(rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})
app.get('/api/queries/q8', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT t.id, t.name AS team_name, t.sport, t.wins AS total_wins,
                   COUNT(m.id) AS total_matches_played,
                   SUM(CASE WHEN m.winner_id = t.id THEN 1 ELSE 0 END) AS matches_won,
                   ROUND((SUM(CASE WHEN m.winner_id = t.id THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(m.id), 0)), 2) AS win_percentage
            FROM teams t
            LEFT JOIN matches m ON t.id = m.team1_id OR t.id = m.team2_id
            GROUP BY t.id, t.name, t.sport, t.wins
            ORDER BY t.sport, t.wins DESC
        `)
        res.json(rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})
app.get('/api/queries/q9', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT e.id, e.name AS event_name, e.sport, e.status, COUNT(DISTINCT m.id) AS total_matches,
                   (SELECT t.name FROM teams t JOIN matches m2 ON m2.winner_id = t.id WHERE m2.event_id = e.id GROUP BY t.id, t.name ORDER BY COUNT(m2.id) DESC LIMIT 1) AS most_winning_team,
                   (SELECT COUNT(*) FROM matches m3 WHERE m3.event_id = e.id AND m3.winner_id = (
                       SELECT m4.winner_id FROM matches m4 WHERE m4.event_id = e.id AND m4.winner_id IS NOT NULL GROUP BY m4.winner_id ORDER BY COUNT(*) DESC LIMIT 1
                   )) AS max_wins_in_event
            FROM events e
            LEFT JOIN matches m ON e.id = m.event_id
            GROUP BY e.id, e.name, e.sport, e.status
            ORDER BY e.start_date DESC
        `)
        res.json(rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})
app.get('/api/queries/q10', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT sport, status, COUNT(*) AS player_count, ROUND(AVG(age), 2) AS avg_age, ROUND(AVG(matches_played), 2) AS avg_matches, ROUND(AVG(runs_scored), 2) AS avg_score, MIN(age) AS youngest, MAX(age) AS oldest
            FROM players
            GROUP BY sport, status WITH ROLLUP
        `)
        res.json(rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})
app.get('/api/logs/latest', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM match_logs ORDER BY timestamp DESC LIMIT 10')
        res.json(rows)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})
const PORT = 5000
initDB().then(() => {
    app.listen(PORT, () => {})
}).catch(err => { process.exit(1) })
