USE sports_management;

INSERT INTO teams (name, sport, coach, founded, wins) VALUES
('India Cricket', 'Cricket', 'Rahul Dravid', 1932, 450),
('Australia Cricket', 'Cricket', 'Andrew McDonald', 1877, 520),
('England Cricket', 'Cricket', 'Brendon McCullum', 1877, 380),
('Inter Miami', 'Football', 'Tata Martino', 2018, 45),
('Al Nassr', 'Football', 'Luis Castro', 1955, 320),
('Manchester United', 'Football', 'Erik ten Hag', 1878, 850),
('Golden State Warriors', 'Basketball', 'Steve Kerr', 1946, 420),
('LA Lakers', 'Basketball', 'Darvin Ham', 1947, 580);

INSERT INTO players (name, age, sport, team_id, matches_played, runs_scored, status) VALUES
('Virat Kohli', 35, 'Cricket', 1, 254, 12000, 'active'),
('Rohit Sharma', 36, 'Cricket', 1, 243, 9500, 'active'),
('KL Rahul', 31, 'Cricket', 1, 150, 4500, 'active'),
('Jasprit Bumrah', 30, 'Cricket', 1, 120, 500, 'active'),
('MS Dhoni', 42, 'Cricket', 1, 350, 10500, 'retired'),
('Steve Smith', 34, 'Cricket', 2, 280, 11000, 'active'),
('David Warner', 37, 'Cricket', 2, 290, 10500, 'active'),
('Pat Cummins', 30, 'Cricket', 2, 150, 800, 'active'),
('Joe Root', 33, 'Cricket', 3, 320, 13000, 'active'),
('Ben Stokes', 32, 'Cricket', 3, 250, 7500, 'active'),
('Lionel Messi', 36, 'Football', 4, 778, 700, 'active'),
('Sergio Busquets', 35, 'Football', 4, 650, 80, 'active'),
('Cristiano Ronaldo', 38, 'Football', 5, 890, 820, 'active'),
('Sadio Mane', 31, 'Football', 5, 450, 250, 'active'),
('Bruno Fernandes', 29, 'Football', 6, 350, 180, 'active'),
('Marcus Rashford', 26, 'Football', 6, 280, 150, 'active'),
('Stephen Curry', 35, 'Basketball', 7, 850, 22000, 'active'),
('Klay Thompson', 33, 'Basketball', 7, 780, 18000, 'active'),
('LeBron James', 39, 'Basketball', 8, 1400, 38000, 'active'),
('Anthony Davis', 30, 'Basketball', 8, 650, 16000, 'active');

INSERT INTO events (name, sport, start_date, end_date, location, status, total_teams) VALUES
('ICC Cricket World Cup 2023', 'Cricket', '2023-10-05', '2023-11-19', 'India', 'completed', 10),
('FIFA World Cup 2022', 'Football', '2022-11-20', '2022-12-18', 'Qatar', 'completed', 32),
('IPL 2024', 'Cricket', '2024-03-22', '2024-05-26', 'India', 'completed', 10),
('UEFA Champions League 2024', 'Football', '2023-09-19', '2024-06-01', 'Europe', 'ongoing', 32),
('NBA Championship 2024', 'Basketball', '2023-10-24', '2024-06-20', 'USA', 'ongoing', 30),
('T20 World Cup 2024', 'Cricket', '2024-06-01', '2024-06-29', 'West Indies', 'upcoming', 20),
('Premier League 2024-25', 'Football', '2024-08-16', '2025-05-25', 'England', 'ongoing', 20);

INSERT INTO matches (event_id, team1_id, team2_id, match_date, location, status, team1_score, team2_score, winner_id) VALUES
(1, 1, 2, '2023-10-08', 'Chennai', 'completed', 199, 240, 2),
(1, 1, 3, '2023-10-29', 'Lucknow', 'completed', 229, 198, 1),
(1, 2, 3, '2023-11-04', 'Ahmedabad', 'completed', 286, 253, 2),
(2, 4, 6, '2022-12-10', 'Doha', 'completed', 2, 1, 4),
(2, 5, 6, '2022-11-24', 'Al Rayyan', 'completed', 1, 3, 6),
(3, 1, 2, '2024-03-24', 'Mumbai', 'completed', 185, 190, 2),
(3, 1, 3, '2024-04-02', 'Bangalore', 'completed', 210, 195, 1),
(4, 4, 6, '2024-02-15', 'Miami', 'completed', 3, 2, 4),
(4, 5, 6, '2024-03-10', 'Manchester', 'ongoing', 0, 0, NULL),
(5, 7, 8, '2024-01-15', 'San Francisco', 'completed', 118, 125, 8),
(5, 7, 8, '2024-02-20', 'Los Angeles', 'ongoing', 0, 0, NULL),
(6, 1, 2, '2024-06-05', 'Bridgetown', 'scheduled', 0, 0, NULL),
(6, 1, 3, '2024-06-12', 'Antigua', 'scheduled', 0, 0, NULL),
(7, 4, 6, '2024-09-14', 'Miami', 'completed', 1, 2, 6),
(7, 5, 6, '2024-10-05', 'Riyadh', 'scheduled', 0, 0, NULL);

INSERT INTO player_match_stats (player_id, match_id, runs_scored, wickets_taken, minutes_played) VALUES
(1, 2, 95, 0, 120),
(2, 2, 87, 0, 110),
(4, 2, 0, 3, 40),
(6, 1, 46, 0, 65),
(7, 1, 163, 0, 150),
(9, 3, 87, 0, 95),
(10, 3, 54, 2, 85),
(11, 4, 2, 0, 90),
(13, 5, 1, 0, 90),
(17, 10, 38, 0, 36),
(19, 10, 40, 0, 38);

INSERT INTO match_logs (match_id, action_type, description) VALUES
(1, 'MATCH_STARTED', 'Match started between India and Australia'),
(1, 'MATCH_COMPLETED', 'Australia won by 41 runs'),
(2, 'MATCH_STARTED', 'Match started between India and England'),
(2, 'MATCH_COMPLETED', 'India won by 31 runs'),
(4, 'MATCH_STARTED', 'Match started between Inter Miami and Manchester United'),
(4, 'MATCH_COMPLETED', 'Inter Miami won 2-1'),
(10, 'MATCH_STARTED', 'Match started between Warriors and Lakers'),
(10, 'MATCH_COMPLETED', 'Lakers won 125-118');