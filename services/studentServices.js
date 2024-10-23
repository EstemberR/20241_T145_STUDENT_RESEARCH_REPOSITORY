    const fs = require('fs');
    const path = require('path');
    const dbPath = path.join(__dirname, '../db.json');
    function readData() {
        const data = fs.readFileSync(dbPath);
        return JSON.parse(data);
    }

    function writeData(data) {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    }

    //function to add research
    function addResearch(newResearch) {
        const data = readData(); // Read existing data
        data.studentResearches.push(newResearch); // Add the new research
        writeData(data);
        return { message: "Research added successfully!" };
    }    

    // Function to edit an existing research entry
    function editResearch(researchID, updatedResearch) {
        const students = readData(); // Read existing data
        const index = students.studentResearches.findIndex(research => research.researchID === researchID);

        if (index !== -1) {
            delete updatedResearch.researchID; 

            students.studentResearches[index] = { ...students.studentResearches[index], ...updatedResearch };
            writeData(students); 
            return { message: "Research updated successfully!" };
        } else {
            throw new Error("Research not found.");
        }
    }

    // Function to delete an existing research entry
    function deleteResearch(researchID) {
        const data = readData();
        let students = data.studentResearches; 
        const initialLength = students.length;
    
        // Filter out the research
        students = students.filter(research => research.researchID !== researchID);
    
        if (students.length < initialLength) {
            data.studentResearches = students; 
            writeData(data); // Write back the entire data object
            return { message: "Research deleted successfully!" };
        } else {
            throw new Error("Research not found");
        }
    }

    //Function to submit/unsubmit
    function toggleSubmissionStatus(researchID) {
        const data = readData(); 
        const research = data.studentResearches.find(item => item.researchID === researchID);

        if (!research) {
            throw new Error('Research not found.'); 
        }

        if (research.status === 'submitted') {
            research.status = 'unsubmitted'; // Mark as unsubmitted
        } else {
            research.status = 'submitted'; // Mark as submitted
        }

        writeData(data); // Write back to the file
        return { message: `Research successfully ${research.status}.` };
    }


    // Function to fetch all student research papers
    function getAllStudentResearches() {
        const data = readData();
        return data.studentResearches;
    }

    // Function to fetch all approved repository research papers
    function getAllRepositoryResearches() {
        const data = readData();
        return data.repositoryResearches;
    }
    // Function to search research papers with optional filters
    function searchResearches({ title, author, date_published }) {
        const studentResearches = readData().repositoryResearches;
        return repositoryResearches.filter(research => {
            const titleMatch = title ? research.title.toLowerCase().includes(title.toLowerCase()) : true;
            const authorMatch = author ? research.authors.some(a => a.toLowerCase().includes(author.toLowerCase())) : true;
            const dateMatch = date_published ? research.date_published.includes(date_published) : true;

            return titleMatch && authorMatch && dateMatch;
        });
    }

    //function to get bookmarked research 
    function getAllBookmarkedResearches() {
        const data = readData();
        return data.bookmarkedResearches;
    }
    // Function to delete an existing research entry
    function removeBookmark(researchID) {
        const data = readData(); 
        let students = data.bookmarkedResearches;
        const initialLength = students.length; 
    
        // Filter out the research
        students = students.filter(research => research.researchID !== researchID);
    
        if (students.length < initialLength) {
            data.bookmarkedResearches = students; 
            writeData(data); 
            return { message: "Bookmark removed successfully!" };
        } else {
            throw new Error("Research not found");
        }
    }

    //get user profile data
    function getUserProfile() {
        const data = readData();
        return data.userProfileData;
    }

    // Function to edit user
    function editUserProfile(userID, updatedUser) {
        const students = readData(); 
        const index = students.userProfileData.findIndex(user => user.userID === userID);

        if (index !== -1) {
            delete updatedUser.userID; 

            students.userProfileData[index] = { ...students.userProfileData[index], ...updatedUser };
            writeData(students); // Write back to the file
            return { message: "user data updated successfully!" };
        } else {
            throw new Error("user not found.");
        }
    }

    // Add a research paper to bookmarks
function addBookmark(researchID) {
    const data = readData(); // Read existing data
    const repositoryResearches = data.repositoryResearches;
    const bookmarkedResearches = data.bookmarkedResearches;

    const research = repositoryResearches.find(item => item.researchID === researchID);

    if (!research) {
        throw new Error('Research not found in the repository');
    }

    const isAlreadyBookmarked = bookmarkedResearches.find(item => item.researchID === researchID);
    if (isAlreadyBookmarked) {
        throw new Error('Research is already bookmarked');
    }

    bookmarkedResearches.push(research);
    writeData(data);

    return { message: "Research bookmarked successfully!" };
}


    module.exports = { 
        addResearch, 
        editResearch, 
        deleteResearch, 
        toggleSubmissionStatus, 
        readData, 
        writeData, 
        getAllStudentResearches, 
        getAllRepositoryResearches, 
        getAllBookmarkedResearches,
        searchResearches,
        removeBookmark,
        getUserProfile,
        editUserProfile,
        addBookmark
    };
