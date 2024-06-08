#!/usr/bin/env osascript -l JavaScript

ObjC.import("stdlib");
ObjC.import("Foundation");
const app = Application.currentApplication();
app.includeStandardAdditions = true;

console.log("Script started");

// Function to delay script execution
//function delay(seconds) {
//    app.doShellScript('sleep ' + seconds);
//}

// Function to check if a file or directory exists
function fileExists(path) {
    const fileManager = $.NSFileManager.defaultManager;
    return fileManager.fileExistsAtPath(path);
}

function createAndCloneRepo(repoName, vaultPath, username, token) {
    try {
        // Construct the path for the new repo within the vault
        const repoPath = `${vaultPath}/${repoName}`;

        // Create the local directory for the repository
        app.doShellScript(`mkdir -p "${repoPath}"`);
        console.log("Local directory for repository created: " + repoPath);

        // Initialize the local directory as a Git repository and create a README.md
        const readmePath = `${repoPath}/README.md`;
        app.doShellScript(`cd "${repoPath}" && git init && echo "# ${repoName}" > "${readmePath}" && git add . && git commit -m "Initial commit with README"`);
        console.log("Git repository initialized and README.md created locally");

        // Authenticate with GitHub and push the local content
        const createRepoCommand = `gh auth login --with-token <<< "${token}" && gh repo create ${repoName} --public --source=. --remote=origin --push`;
        app.doShellScript(`cd "${repoPath}" && ${createRepoCommand}`);
        console.log("Repository created on GitHub and local content pushed");

        
        // Create a new Keynote presentation, save it, and open it
        const keynote = Application('Keynote');
        keynote.includeStandardAdditions = true;

        // Check if Keynote is running, if not, launch it
        if (!keynote.running()) {
            keynote.activate();
            //delay(1); // Wait for Keynote to initialize
        }

        try {
            // Create a new Keynote document
            keynote.Document().make();
            const presentation = keynote.documents[0];

            // // Construct the path for the Keynote file within the repo
            // const keynotePath = `${repoPath}/${repoName}.key`;

            // // // Check if the directory is writable
            // // const fileManager = $.NSFileManager.defaultManager;
            // // if (!fileManager.isWritableFileAtPath(repoPath)) {
            // //     throw new Error(`The directory at ${repoPath} is not writable. Check permissions.`);
            // // }

            // // // Grant read and write permissions to the user for the repository directory
            // // const chmodCommand = `chmod -R u+rwX "${repoPath}"`;
            // // app.doShellScript(chmodCommand);
            // // console.log("Read and write permissions granted to the user for the directory: " + repoPath);

            // // Save the new Keynote document
            // presentation.save({ in: keynotePath });
            // console.log("Keynote presentation created and saved: " + keynotePath);

            // // Open the newly created Keynote file
            // app.doShellScript(`open -a Keynote "${keynotePath}"`);
            // console.log("Keynote presentation opened for editing");
        } catch (error) {
            console.log("Error creating Keynote presentation: " + error);
            throw error; // Re-throw the error to handle it in the calling function
        }

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
        const githubUsername = $.getenv("github_username");
        const githubToken = $.getenv("github_token");

        let repoName = argv[0]?.trim() || "Untitled";
        repoName = repoName.replace(/[\\/:]/g, "");

        createAndCloneRepo(repoName, vaultPath, githubUsername, githubToken);
    } catch (error) {
        console.log("Error in run function: " + error);
    }
}
