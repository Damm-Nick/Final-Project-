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
        const [rows] = await pool.query(`
            SELECT p.*, t.name as team_name, t.coach, t.sport as team_sport
            FROM players p 
            LEFT JOIN teams t ON p.team_id = t.id 
            WHERE p.id = ?
        `, [req.params.id])
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Player not found' })
        }
        
        // Get player match stats
        const [matchStats] = await pool.query(`
            SELECT 
                pms.*,
                m.match_date,
                e.name as event_name,
                t1.name as team1_name,
                t2.name as team2_name
            FROM player_match_stats pms
            JOIN matches m ON pms.match_id = m.id
            JOIN events e ON m.event_id = e.id
            JOIN teams t1 ON m.team1_id = t1.id
            JOIN teams t2 ON m.team2_id = t2.id
            WHERE pms.player_id = ?
            ORDER BY m.match_date DESC
        `, [req.params.id])
        
        res.json({ player: rows[0], matchStats })
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

app.get('/api/teams/:id/statistics', async (req, res) => {
    try {
        const [rows] = await pool.query('CALL GetTeamStatistics(?)', [req.params.id])
        res.json(rows[0][0] || {})
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

const PORT = 5000
initDB().then(() => {
    app.listen(PORT, () => { console.log(`Server running on http://localhost:${PORT}`) })
}).catch(err => { console.error('Database connection failed:', err); process.exit(1) })