#!/usr/bin/env python3

import os
import subprocess
import sys
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(message)s')

def run_command(command):
    try:
        logging.info(f"Executing command: {command}")
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        logging.info(f"Command output: {result.stdout}")
        if result.stderr:
            logging.info(f"Command error output: {result.stderr}")
    except subprocess.CalledProcessError as error:
        logging.error(f"Command '{command}' failed with error: {error}")
        sys.exit(1)

def clone_repo(remote_url, destination_path):
    # Construct the path for the new repo within the destination path
    repo_name = remote_url.split('/')[-1].replace('.git', '')
    repo_path = os.path.join(destination_path, repo_name)
    logging.info(f"Repository name: {repo_name}")
    logging.info(f"Destination path: {destination_path}")
    logging.info(f"Local repository path: {repo_path}")

    # Clone the remote repository
    command = f'git clone "{remote_url}" "{repo_path}"'
    run_command(command)
    logging.info(f"Repository cloned to: {repo_path}")
    
    return repo_path

def create_sublime_project(repo_path):
    project_name = os.path.basename(repo_path)
    project_file = f"{repo_path}/{project_name}.sublime-project"
    
    project_data = {
        "folders": [
            {
                "path": repo_path
            }
        ]
    }
    
    with open(project_file, 'w') as f:
        json.dump(project_data, f, indent=4)
    
    logging.info(f"Sublime project file created: {project_file}")
    return project_file

def create_sublime_workspace(repo_path, project_file):
    workspace_name = os.path.basename(repo_path)
    workspace_file = f"{repo_path}/{workspace_name}.sublime-workspace"
    
    workspace_data = {
        "folders": [
            {
                "path": repo_path
            }
        ],
        "window": {
            "layout": {
                "cols": [0.0, 1.0],
                "rows": [0.0, 0.8, 1.0],
                "cells": [[0, 0, 1, 1], [0, 1, 1, 2]]
            },
            "groups": [
                {
                    "selected": 0,
                    "sheets": []
                },
                {
                    "selected": 0,
                    "sheets": []
                }
            ]
        }
    }
    
    with open(workspace_file, 'w') as f:
        json.dump(workspace_data, f, indent=4)
    
    logging.info(f"Sublime workspace file created: {workspace_file}")
    return workspace_file

def open_in_sublime(repo_path):
    command = f"subl \"{repo_path}\""
    run_command(command)
    logging.info(f"Opened repository in Sublime Text: {repo_path}")

def add_to_gitfox(repo_path):
    command = f"gitfox \"{repo_path}\""
    run_command(command)
    logging.info(f"Repository added to GitFox: {repo_path}")

def main():
    if len(sys.argv) != 2:
        logging.error("Usage: clone_repo.py <remote_url>")
        sys.exit(1)

    remote_url = sys.argv[1].strip()
    logging.info(f"Received remote URL: {remote_url}")
    destination_path = os.getenv("vault_path", os.getcwd())
    logging.info(f"Using destination path: {destination_path}")

    repo_path = clone_repo(remote_url, destination_path)
    project_file = create_sublime_project(repo_path)
    create_sublime_workspace(repo_path, project_file)
    open_in_sublime(repo_path)
    add_to_gitfox(repo_path)

if __name__ == "__main__":
    logging.info("Script started")
    main()