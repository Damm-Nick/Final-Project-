import { useState, useEffect } from 'react'
import './App.css'
const API_URL = 'http://localhost:5000/api'

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [players, setPlayers] = useState([])
  const [teams, setTeams] = useState([])
  const [events, setEvents] = useState([])
  const [matches, setMatches] = useState([])
  const [stats, setStats] = useState({ players: 0, teams: 0, events: 0, matches: 0 })
  const [q1, setQ1] = useState([])
  const [q2, setQ2] = useState([])
  const [q3, setQ3] = useState([])
  const [q4, setQ4] = useState([])
  const [q6, setQ6] = useState([])
  const [q10, setQ10] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddPlayer, setShowAddPlayer] = useState(false)
  const [showAddTeam, setShowAddTeam] = useState(false)
  const [showAddEvent, setShowEvent] = useState(false)
  const [playerForm, setPlayerForm] = useState({})
  const [teamForm, setTeamForm] = useState({})
  const [eventForm, setEventForm] = useState({})

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await Promise.all([
        fetch(`${API_URL}/players`),
        fetch(`${API_URL}/teams`),
        fetch(`${API_URL}/events`),
        fetch(`${API_URL}/matches`),
        fetch(`${API_URL}/stats`),
        fetch(`${API_URL}/queries/q1`),
        fetch(`${API_URL}/queries/q2`),
        fetch(`${API_URL}/queries/q3`),
        fetch(`${API_URL}/queries/q4`),
        fetch(`${API_URL}/queries/q6`),
        fetch(`${API_URL}/queries/q10`),
        fetch(`${API_URL}/logs`)
      ])
      const json = await Promise.all(res.map(r => r.ok ? r.json() : []))
      setPlayers(json[0] || [])
      setTeams(json[1] || [])
      setEvents(json[2] || [])
      setMatches(json[3] || [])
      setStats(json[4] || { players: 0, teams: 0, events: 0, matches: 0 })
      setQ1(json[5] || [])
      setQ2(json[6] || [])
      setQ3(json[7] || [])
      setQ4(json[8] || [])
      setQ6(json[9] || [])
      setQ10(json[10] || [])
      setLogs(json[11] || [])
    } catch {
      setError('Backend connection failed')
    } finally {
      setLoading(false)
    }
  }

  const addPlayer = async () => {
    if (!playerForm.name || !playerForm.age || !playerForm.sport || !playerForm.team_id) return alert('Fill all fields')
    await fetch(`${API_URL}/players`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(playerForm) })
    fetchAll(); setShowAddPlayer(false); setPlayerForm({})
  }

  const addTeam = async () => {
    if (!teamForm.name || !teamForm.sport) return alert('Fill all fields')
    await fetch(`${API_URL}/teams`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(teamForm) })
    fetchAll(); setShowAddTeam(false); setTeamForm({})
  }

  const addEvent = async () => {
    if (!eventForm.name || !eventForm.start_date) return alert('Fill all fields')
    await fetch(`${API_URL}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(eventForm) })
    fetchAll(); setShowEvent(false); setEventForm({})
  }

  const delPlayer = async id => {
    if (!confirm('Delete player?')) return
    await fetch(`${API_URL}/players/${id}`, { method: 'DELETE' })
    fetchAll()
  }

  const completeMatch = async (id, t1, t2) => {
    const s1 = prompt('Team 1 score', '0'), s2 = prompt('Team 2 score', '0')
    if (!s1 || !s2) return
    const winner = parseInt(s1) > parseInt(s2) ? t1 : t2
    await fetch(`${API_URL}/matches/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'completed', team1_score: +s1, team2_score: +s2, winner_id: winner }) })
    fetchAll()
  }

  if (loading) return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <h1>VIT’s Sport Event Management</h1>
            <p>For Vishwakarandak 25</p>
          </div>
        </div>
      </header>
      <div className="container"><div className="content"><div className="loading-container"><div className="spinner"></div><div className="no-data">Loading...</div></div></div></div>
    </div>
  )

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <h1>VIT’s Sport Event Management</h1>
            <p>For Vishwakarandak 25</p>
          </div>
          <div className="header-stats">
            <div className="stat-card"><div className="stat-number">{stats.players}</div><div className="stat-label">Players</div></div>
            <div className="stat-card"><div className="stat-number">{stats.teams}</div><div className="stat-label">Teams</div></div>
            <div className="stat-card"><div className="stat-number">{stats.events}</div><div className="stat-label">Events</div></div>
            <div className="stat-card"><div className="stat-number">{stats.matches}</div><div className="stat-label">Matches</div></div>
          </div>
        </div>
      </header>

      <div className="container">
        {error && <div className="error-banner">{error}</div>}
        <div className="tabs">
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          <button className={activeTab === 'players' ? 'active' : ''} onClick={() => setActiveTab('players')}>Players</button>
          <button className={activeTab === 'teams' ? 'active' : ''} onClick={() => setActiveTab('teams')}>Teams</button>
          <button className={activeTab === 'events' ? 'active' : ''} onClick={() => setActiveTab('events')}>Events</button>
          <button className={activeTab === 'matches' ? 'active' : ''} onClick={() => setActiveTab('matches')}>Matches</button>
          <button className={activeTab === 'logs' ? 'active' : ''} onClick={() => setActiveTab('logs')}>Logs</button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="content">
            <div className="dashboard-grid">
              <div className="stat-card-large"><div><h3>{stats.players}</h3><p>Players</p></div></div>
              <div className="stat-card-large"><div><h3>{stats.teams}</h3><p>Teams</p></div></div>
              <div className="stat-card-large"><div><h3>{stats.events}</h3><p>Events</p></div></div>
              <div className="stat-card-large"><div><h3>{stats.matches}</h3><p>Matches</p></div></div>
            </div>

            <div className="dashboard-actions">
              <button className="btn-action" onClick={() => setActiveTab('players')}>View Players</button>
              <button className="btn-action" onClick={() => setActiveTab('events')}>Browse Events</button>
            </div>

            <div className="section">
              <h2 className="section-title">Top Players</h2>
              <div className="list">
                {q1.length === 0 ? <div className="no-data">No data</div> : q1.map(p => (
                  <div key={p.id} className="list-row">
                    <div className="left">
                      <div className="title">{p.name}</div>
                      <div className="subtitle">{p.sport} · {p.team_name}</div>
                    </div>
                    <div className="right">
                      <div className="primary">{p.runs_scored}</div>
                      <div className="muted">Avg {p.avg_per_match || 0}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'players' && (
          <div className="content">
            <div className="content-header">
              <h2>Players</h2>
              <button className="btn-primary" onClick={() => setShowAddPlayer(!showAddPlayer)}>{showAddPlayer ? 'Cancel' : '+ Add Player'}</button>
            </div>

            {showAddPlayer && (
              <div className="form-card">
                <div className="form-grid">
                  <input placeholder="Name" value={playerForm.name || ''} onChange={e => setPlayerForm({ ...playerForm, name: e.target.value })} />
                  <input placeholder="Age" type="number" value={playerForm.age || ''} onChange={e => setPlayerForm({ ...playerForm, age: e.target.value })} />
                  <input placeholder="Sport" value={playerForm.sport || ''} onChange={e => setPlayerForm({ ...playerForm, sport: e.target.value })} />
                  <select value={playerForm.team_id || ''} onChange={e => setPlayerForm({ ...playerForm, team_id: e.target.value })}>
                    <option value="">Select Team</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <button className="btn-success" onClick={addPlayer}>Save</button>
                </div>
              </div>
            )}

            <div className="list">
              {players.map(p => (
                <div key={p.id} className="list-row">
                  <div className="left">
                    <div className="title">{p.name}</div>
                    <div className="subtitle">{p.sport} · {p.team_name || '—'}</div>
                  </div>
                  <div className="right small-rows">
                    <div className="meta">{p.matches_played} matches</div>
                    <div className="meta">{p.runs_scored} runs</div>
                    <div className={`status-pill ${p.status}`}>{p.status}</div>
                    <button className="btn-outline" onClick={() => delPlayer(p.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="content">
            <div className="content-header">
              <h2>Events</h2>
              <button className="btn-primary" onClick={() => setShowEvent(!showAddEvent)}>{showAddEvent ? 'Cancel' : '+ Add Event'}</button>
            </div>

            {showAddEvent && (
              <div className="form-card">
                <div className="form-grid">
                  <input placeholder="Event name" value={eventForm.name || ''} onChange={e => setEventForm({ ...eventForm, name: e.target.value })} />
                  <input type="date" value={eventForm.start_date || ''} onChange={e => setEventForm({ ...eventForm, start_date: e.target.value })} />
                  <input type="date" value={eventForm.end_date || ''} onChange={e => setEventForm({ ...eventForm, end_date: e.target.value })} />
                  <input placeholder="Location" value={eventForm.location || ''} onChange={e => setEventForm({ ...eventForm, location: e.target.value })} />
                  <button className="btn-success" onClick={addEvent}>Save</button>
                </div>
              </div>
            )}

            <div className="list">
              {events.map(e => (
                <div key={e.id} className="list-row">
                  <div className="left">
                    <div className="title">{e.name}</div>
                    <div className="subtitle">{e.sport} · {e.location}</div>
                  </div>
                  <div className="right small-rows">
                    <div className="meta">{new Date(e.start_date).toLocaleDateString()} - {new Date(e.end_date).toLocaleDateString()}</div>
                    <div className={`status-pill ${e.status}`}>{e.status}</div>
                    <div className="meta">{e.total_teams} teams</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="content">
            <div className="content-header"><h2>Matches</h2></div>
            <div className="list">
              {matches.map(m => (
                <div key={m.id} className="list-row">
                  <div className="left">
                    <div className="title">{m.team1_name} vs {m.team2_name}</div>
                    <div className="subtitle">{m.event_name} · {new Date(m.match_date).toLocaleDateString()}</div>
                  </div>
                  <div className="right small-rows">
                    <div className="score">{m.team1_score} - {m.team2_score}</div>
                    <div className={`status-pill ${m.status}`}>{m.status}</div>
                    {m.status === 'scheduled' && <button className="btn-outline" onClick={() => completeMatch(m.id, m.team1_id, m.team2_id)}>Complete</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="content">
            <div className="content-header"><h2>Trigger Logs</h2></div>
            <div className="list">
              {logs.length === 0 ? <div className="no-data">No logs</div> : logs.map(l => (
                <div key={l.id} className="list-row">
                  <div className="left">
                    <div className="title">{l.action_type}</div>
                    <div className="subtitle">{l.match_info}</div>
                  </div>
                  <div className="right small-rows">
                    <div className="meta">{new Date(l.timestamp).toLocaleString()}</div>
                    <div className="muted">{l.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="footer"><p>VIT’s Sport Event Management • Vishwakarandak 25</p></footer>
    </div>
  )
}
