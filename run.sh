#!/bin/bash
flyway -url=jdbc:$DATABASE_URL -user=upsigiqqutewsq -password=8858982e3e4f71af0a3cd6dbb08eadb8df33a18f54a8f6a7df40a38a51b1a5d6 -mixed=true -connectRetries=60 migrate
