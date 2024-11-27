const fs = require("fs").promises;

async function readJSON(filename) {
    try {
        const data = await fs.readFile(filename, "utf8");
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error reading JSON file: ${filename}`, err);
        throw new Error("Unable to read beverage data. Please contact the administrator.");
    }
}

async function writeJSON(object, filename) {
    try {
        const allObjects = await readJSON(filename);
        allObjects.push(object);
        await fs.writeFile(filename, JSON.stringify(allObjects, null, 2), "utf8");
        return allObjects;
    } catch (err) {
        console.error(`Error writing to JSON file: ${filename}`, err);
        throw new Error("Write error"); // Ensure this matches the test expectation
    }
}


async function searchbeverage(req, res) {
    try {
        const allResources = await readJSON("utils/beverages.json");

        if (!allResources || allResources.length === 0) {
            return res.status(404).json({ message: "No beverages found in the system." });
        }

        const searchQuery = req.query.name ? req.query.name.toLowerCase() : "";

        if (!searchQuery) {
            return res.status(200).json(allResources); // Return all beverages
        }

        const filteredResources = allResources.filter(resource =>
            resource.name.toLowerCase().includes(searchQuery)
        );

        return res.status(200).json(filteredResources); // Always return 200
    } catch (error) {
        console.error("Error in searchbeverage function:", error.message);
        return res.status(500).json({ message: error.message });
    }
}

module.exports = {
    readJSON,
    writeJSON,
    searchbeverage,
};
