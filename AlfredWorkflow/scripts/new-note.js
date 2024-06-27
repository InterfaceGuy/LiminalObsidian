#!/usr/bin/env osascript -l JavaScript

ObjC.import("stdlib");
ObjC.import("Foundation");
const app = Application.currentApplication();
app.includeStandardAdditions = true;

console.log("Script started");

// Function to check if a file or directory exists
function fileExists(path) {
    const fileManager = $.NSFileManager.defaultManager;
    return fileManager.fileExistsAtPath(path);
}

function createAndCloneRepo(repoName, vaultPath, templatePath, username, token) {
    try {
        // Construct the path for the new repo within the vault
        const repoPath = `${vaultPath}/${repoName}`;

        // Clone the local template repository
        app.doShellScript(`git clone "${templatePath}" "${repoPath}"`);
        console.log("Local template repository cloned: " + repoPath);

        // Remove the existing .git directory to reinitialize the repository
        app.doShellScript(`rm -rf "${repoPath}/.git" && cd "${repoPath}" && git init`);
        console.log(".git directory removed and repository reinitialized");

        // Make an initial commit
        app.doShellScript(`cd "${repoPath}" && git add . && git commit -m "Initial commit from template"`);
        console.log("Initial commit made");

        // Authenticate with GitHub and push the local content to the new repository
        const createRepoCommand = `gh auth login --with-token <<< "${token}" && gh repo create ${username}/${repoName} --public --source=. --remote=origin --push`;
        app.doShellScript(`cd "${repoPath}" && ${createRepoCommand}`);
        console.log("Repository created on GitHub and local content pushed");

        // Open the local repository in Gitfox using absolute path and cd command
        const openInGitfoxCommand = `cd "${vaultPath}" && gitfox "${repoName}"`;
        app.doShellScript(openInGitfoxCommand);
        console.log("Local repository opened in Gitfox");

        return repoPath; // Return the local repository path
    } catch (error) {
        console.log("Error in createAndCloneRepo: " + error);
        throw error; // Re-throw the error to handle it in the calling function
    }
}

// Main function to run
function run(argv) {
    try {
        const vaultPath = $.getenv("vault_path");
        const templatePath = `${vaultPath}/dreamnode`; // Path to the local template repository
        const githubUsername = $.getenv("github_username");
        const githubToken = $.getenv("github_token");

        let repoName = argv[0]?.trim() || "Untitled";
        repoName = repoName.replace(/[\\/:]/g, "");

        createAndCloneRepo(repoName, vaultPath, templatePath, githubUsername, githubToken);
    } catch (error) {
        console.log("Error in run function: " + error);
    }
}