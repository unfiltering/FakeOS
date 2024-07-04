document.addEventListener("DOMContentLoaded", () => {
    initializeFakeOS();
});

let currentDirectory = []; // Array to track current directory path

function initializeFakeOS() {
    console.log("Initializing Fake OS...");
    openFileSystem(); // Load the initial file system
}

function openFileSystem() {
    console.log("Opening file system...");
    document.getElementById('file-system').style.display = 'flex';
    loadFileSystem();
}

function closeWindow(windowId) {
    console.log(`Closing window: ${windowId}`);
    document.getElementById(windowId).style.display = 'none';
}

function createFileOrFolder() {
    console.log("Creating file or folder...");
    const name = prompt("Enter file or folder name:");
    if (name) {
        let path = prompt("Enter path (e.g., F:/Epic/ or F:/):");
        let files = JSON.parse(localStorage.getItem('fakeOS_files')) || [];
        
        if (!path) {
            // If path is not provided, assume root directory 'F:/'
            path = 'F:/';
        } else {
            // Normalize and validate path
            path = normalizePath(path);
        }
        
        // Create file or folder object
        let isFolder = !hasFileExtension(name);
        
        // Adjust path for folders created in subdirectories
        if (isFolder && !path.endsWith('/')) {
            path += '/';
        }
        
        let fullPath = path + name;
        
        // Check if the file or folder already exists
        if (files.some(file => file.path === fullPath)) {
            alert(`File or folder '${name}' already exists at '${fullPath}'.`);
            return;
        }
        
        // Create the file or folder entry
        let newEntry = { name, path };
        files.push(newEntry);
        
        // If it's a folder, initialize contents array
        if (isFolder) {
            newEntry.contents = [];
        }
        
        // Update contents array of parent folder, if applicable
        let parentFolder = getParentFolder(path, files);
        if (parentFolder) {
            parentFolder.contents = parentFolder.contents || [];
            parentFolder.contents.push(newEntry);
        }
        
        localStorage.setItem('fakeOS_files', JSON.stringify(files));
        
        console.log(`File or folder created: ${name} at ${path}`);
        
        // Only reload file system if current directory matches or is parent of the new entry's path
        if (isInCurrentDirectory(fullPath)) {
            loadFileSystem();
        }
    }
}

function loadFileSystem() {
    console.log("Loading file system...");
    let files = JSON.parse(localStorage.getItem('fakeOS_files')) || [];
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = '';
    
    // Add ".." button if not in root directory
    if (currentDirectory.length > 0) {
        let listItem = document.createElement('li');
        listItem.textContent = "..";
        listItem.classList.add('folder');
        listItem.onclick = () => goBack();
        fileList.appendChild(listItem);
    }
    
    // Display files and folders in the current directory
    files.forEach(file => {
        if (isInCurrentDirectory(file.path)) {
            let listItem = document.createElement('li');
            listItem.textContent = file.name;
            
            if (file.contents) {
                listItem.classList.add('folder');
                listItem.onclick = () => openFolder(file.name);
            } else {
                listItem.onclick = () => openFile(file.name);
            }
            
            fileList.appendChild(listItem);
        }
    });
    
    updateWindowTitle(); // Update window title with current directory
}

function updateWindowTitle() {
    let currentPath = 'F:/'; // Start with the drive prefix
    if (currentDirectory.length > 0) {
        currentPath += currentDirectory.join('/') + '/';
    }
    document.getElementById('window-title').textContent = 'File System | ' + currentPath;
}

function openFile(fileName) {
    console.log(`Opening file: ${fileName}`);
    alert(`Opening file: ${fileName}`);
}

function openFolder(folderName) {
    console.log(`Opening folder: ${folderName}`);
    currentDirectory.push(folderName); // Change directory to the selected folder
    loadFileSystem();
}

function goBack() {
    console.log("Going back one level...");
    currentDirectory.pop(); // Go back one level in the directory
    loadFileSystem();
}

function isInCurrentDirectory(filePath) {
    // Handle root directory case
    if (currentDirectory.length === 0) {
        return filePath === 'F:/';
    }
    
    // Normalize filePath to ensure it starts with 'F:/'
    if (!filePath.startsWith('F:/')) {
        filePath = 'F:/' + filePath;
    }
    
    // Check if filePath starts with current directory path
    return filePath.startsWith(currentDirectory.join('/') + '/');
}

function normalizePath(path) {
    // Normalize path and ensure it starts with 'F:/'
    if (!path.startsWith('F:/')) {
        path = 'F:/' + path; // Add 'F:/' at the beginning
    }
    
    path = path.replace(/\/$/, ''); // Remove trailing slash if any
    return path;
}

function hasFileExtension(fileName) {
    // Check if fileName has an extension
    return fileName.includes('.') && !fileName.endsWith('.');
}

function getParentFolder(path, files) {
    if (currentDirectory.length === 0) {
        return null; // No parent folder in root directory
    }
    
    // Construct full path of the parent folder
    let parentFolderPath = 'F:/' + currentDirectory.join('/');
    
    // Find the parent folder in the files array
    return files.find(folder => folder.path === parentFolderPath && folder.name === currentDirectory[currentDirectory.length - 1]);
}
