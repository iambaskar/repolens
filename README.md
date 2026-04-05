## Repolens
A full-featured **GitHub Repository Activity Visualizer** that provides deep insights into repository behavior and developer activity through interactive and intuitive visualizations.


## Without Token
* No setup required
* Works with public repositories
* Limited requests per hour (GitHub API limit)

## With Token (Recommended)
* Higher rate limits
* Better performance
* Required for accessing private repositories

## How to Generate GitHub Token
* Open GitHub → Click your profile (top right)
* Go to Settings
* Scroll → Developer Settings
* Click Personal Access Tokens
* Select Tokens (classic)
* Click Generate new token → Generate new token (classic)

### Configure:
**Note**: repo-visualizer
**Expiration**: 30–90 days

### Scopes:
**read**:user
* repo (optional, for private repos)
* Click Generate token
* Copy the token

## Key Features:
* Commit Analytics – Visual timeline of commits to track development frequency
* Overview of PR activity and trends
* GitHub-style activity calendar
* Tracks lines added and deleted per file
* Interactive relationship graph between files, commits, and contributors

## Tech Stack:
* React (UI & state management)
* D3.js (data visualization & custom graphs)
* GitHub REST API (data fetching)




