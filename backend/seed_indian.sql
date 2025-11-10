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

INSERT INTO teams (id,name,sport,coach,founded,total_players,wins) VALUES
(1,'Mumbai Indians','Cricket','Rohit Sharma',1999,0,0),
(2,'Chennai Super Kings','Cricket','MS Dhoni',1998,0,0),
(3,'Royal Challengers Bengaluru','Cricket','Faf du Plessis',2008,0,0),
(4,'Delhi Capitals','Cricket','Ricky Ponting',2008,0,0),
(5,'Kolkata Knight Riders','Cricket','Shreyas Iyer',2008,0,0);

INSERT INTO players (id,name,age,sport,team_id,matches_played,runs_scored,status) VALUES
(1,'Virat Kohli',36,'Cricket',3,250,12000,'active'),
(2,'Rohit Sharma',36,'Cricket',1,240,9200,'active'),
(3,'Jasprit Bumrah',30,'Cricket',1,110,50,'active'),
(4,'KL Rahul',31,'Cricket',4,160,5400,'active'),
(5,'Shubman Gill',25,'Cricket',5,60,2300,'active'),
(6,'MS Dhoni',43,'Cricket',2,350,10500,'retired');

UPDATE teams SET total_players = 3 WHERE id = 1;
UPDATE teams SET total_players = 2 WHERE id = 2;
UPDATE teams SET total_players = 1 WHERE id = 3;
UPDATE teams SET total_players = 2 WHERE id = 4;
UPDATE teams SET total_players = 1 WHERE id = 5;

INSERT INTO events (id,name,sport,start_date,end_date,location,status,total_teams) VALUES
(1,'IPL 2024','Cricket','2024-03-29','2024-05-26','India','completed',10),
(2,'Ranji Trophy 2024','Cricket','2024-01-10','2024-04-15','India','completed',38),
(3,'Vijay Hazare Cup 2024','Cricket','2024-10-01','2024-11-15','India','upcoming',38);

INSERT INTO matches (id,event_id,team1_id,team2_id,match_date,location,status,team1_score,team2_score,winner_id) VALUES
(1,1,1,2,'2024-04-10','Mumbai','completed',180,165,1),
(2,1,3,4,'2024-04-12','Bengaluru','completed',150,152,4),
(3,1,5,1,'2024-04-15','Kolkata','completed',140,142,1),
(4,3,2,3,'2024-10-10','Chennai','scheduled',0,0,NULL),
(5,3,4,5,'2024-10-12','Delhi','scheduled',0,0,NULL);

INSERT INTO player_match_stats (player_id,match_id,runs_scored,wickets_taken,minutes_played) VALUES
(1,1,88,0,120),
(2,1,54,0,95),
(3,2,10,2,60),
(4,2,72,0,110),
(5,3,65,0,105);

INSERT INTO match_logs (match_id,action_type,description) VALUES
(1,'MATCH_COMPLETED','Mumbai Indians defeated Chennai Super Kings by 15 runs'),
(2,'MATCH_COMPLETED','Delhi Capitals edged out RCB by 2 runs'),
(3,'MATCH_COMPLETED','Mumbai Indians beat KKR by 2 runs');

CREATE INDEX idx_players_team ON players(team_id);
CREATE INDEX idx_players_sport ON players(sport);
CREATE INDEX idx_matches_event ON matches(event_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_teams_sport ON teams(sport);
