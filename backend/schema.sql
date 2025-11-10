DROP DATABASE IF EXISTS sports_management;
CREATE DATABASE sports_management;
USE sports_management;

CREATE TABLE teams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    sport VARCHAR(50) NOT NULL,
    coach VARCHAR(100),
    founded INT,
    total_players INT DEFAULT 0,
    wins INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE players (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    sport VARCHAR(50) NOT NULL,
    team_id INT,
    matches_played INT DEFAULT 0,
    runs_scored INT DEFAULT 0,
    status ENUM('active', 'retired', 'injured') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
);

CREATE TABLE events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    sport VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    location VARCHAR(100),
    status ENUM('upcoming', 'ongoing', 'completed') DEFAULT 'upcoming',
    total_teams INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE matches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    team1_id INT NOT NULL,
    team2_id INT NOT NULL,
    match_date DATE NOT NULL,
    location VARCHAR(100),
    status ENUM('scheduled', 'ongoing', 'completed', 'cancelled') DEFAULT 'scheduled',
    team1_score INT DEFAULT 0,
    team2_score INT DEFAULT 0,
    winner_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (team1_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (team2_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (winner_id) REFERENCES teams(id) ON DELETE SET NULL
);

CREATE TABLE player_match_stats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    player_id INT NOT NULL,
    match_id INT NOT NULL,
    runs_scored INT DEFAULT 0,
    wickets_taken INT DEFAULT 0,
    minutes_played INT DEFAULT 0,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
);

CREATE TABLE match_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    match_id INT NOT NULL,
    action_type VARCHAR(50),
    description TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
);

DELIMITER //

CREATE TRIGGER after_player_insert
AFTER INSERT ON players
FOR EACH ROW
BEGIN
    UPDATE teams 
    SET total_players = total_players + 1 
    WHERE id = NEW.team_id;
END//

CREATE TRIGGER after_player_delete
AFTER DELETE ON players
FOR EACH ROW
BEGIN
    UPDATE teams 
    SET total_players = total_players - 1 
    WHERE id = OLD.team_id AND total_players > 0;
END//

CREATE TRIGGER after_player_update_team
AFTER UPDATE ON players
FOR EACH ROW
BEGIN
    IF OLD.team_id != NEW.team_id THEN
        UPDATE teams SET total_players = total_players - 1 WHERE id = OLD.team_id AND total_players > 0;
        UPDATE teams SET total_players = total_players + 1 WHERE id = NEW.team_id;
    END IF;
END//

CREATE TRIGGER after_match_update
AFTER UPDATE ON matches
FOR EACH ROW
BEGIN
    DECLARE completed_matches INT;
    DECLARE total_matches INT;
    
    IF NEW.status = 'completed' THEN
        INSERT INTO match_logs (match_id, action_type, description)
        VALUES (NEW.id, 'MATCH_COMPLETED', CONCAT('Match completed: Team ', NEW.team1_id, ' vs Team ', NEW.team2_id));
        
        IF NEW.winner_id IS NOT NULL THEN
            UPDATE teams SET wins = wins + 1 WHERE id = NEW.winner_id;
        END IF;
    END IF;
    
    SELECT COUNT(*) INTO total_matches FROM matches WHERE event_id = NEW.event_id;
    SELECT COUNT(*) INTO completed_matches FROM matches WHERE event_id = NEW.event_id AND status = 'completed';
    
    IF completed_matches = total_matches THEN
        UPDATE events SET status = 'completed' WHERE id = NEW.event_id;
    ELSEIF completed_matches > 0 THEN
        UPDATE events SET status = 'ongoing' WHERE id = NEW.event_id;
    END IF;
END//

CREATE TRIGGER before_match_insert
BEFORE INSERT ON matches
FOR EACH ROW
BEGIN
    IF NEW.team1_id = NEW.team2_id THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'A team cannot play against itself';
    END IF;
END//

CREATE TRIGGER after_player_match_stats_insert
AFTER INSERT ON player_match_stats
FOR EACH ROW
BEGIN
    UPDATE players 
    SET matches_played = matches_played + 1,
        runs_scored = runs_scored + NEW.runs_scored
    WHERE id = NEW.player_id;
END//

-- Stored Procedure for Team Statistics
CREATE PROCEDURE GetTeamStatistics(IN team_id INT)
BEGIN
    SELECT 
        t.id,
        t.name AS team_name,
        t.sport,
        t.coach,
        t.founded,
        t.total_players,
        t.wins,
        COUNT(DISTINCT p.id) AS actual_player_count,
        ROUND(AVG(p.age), 2) AS avg_player_age,
        SUM(p.runs_scored) AS total_team_runs,
        SUM(p.matches_played) AS total_team_matches,
        ROUND(SUM(p.runs_scored) / NULLIF(SUM(p.matches_played), 0), 2) AS team_avg_performance,
        (SELECT COUNT(*) FROM matches WHERE (team1_id = t.id OR team2_id = t.id) AND status = 'completed') AS matches_played,
        (SELECT COUNT(*) FROM matches WHERE winner_id = t.id) AS matches_won,
        ROUND((SELECT COUNT(*) FROM matches WHERE winner_id = t.id) * 100.0 / 
              NULLIF((SELECT COUNT(*) FROM matches WHERE (team1_id = t.id OR team2_id = t.id) AND status = 'completed'), 0), 2) AS win_percentage,
        (SELECT COUNT(DISTINCT e.id) FROM events e 
         JOIN matches m ON e.id = m.event_id 
         WHERE (m.team1_id = t.id OR m.team2_id = t.id)) AS events_participated
    FROM teams t
    LEFT JOIN players p ON t.id = p.team_id
    WHERE t.id = team_id
    GROUP BY t.id, t.name, t.sport, t.coach, t.founded, t.total_players, t.wins;
END//

DELIMITER ;

CREATE INDEX idx_players_team ON players(team_id);
CREATE INDEX idx_players_sport ON players(sport);
CREATE INDEX idx_matches_event ON matches(event_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_teams_sport ON teams(sport);