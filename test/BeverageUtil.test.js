const { expect } = require("chai");
const chai = require("chai");
const chaiHttp = require("chai-http");
const { app, server } = require("../index");
const { readJSON, writeJSON } = require("../utils/searchUtil");
const sinon = require("sinon");
const fs = require("fs").promises; // For mocking file operations
chai.use(chaiHttp);

describe("Search Beverage API", () => {
    before(() => {
        console.log("Starting Search API tests...");
    });

    after(() => {
        server.close(); // Ensure the server closes after tests
    });

    it("should return matching beverages for a valid search query", (done) => {
        chai.request(app)
            .get("/search-beverage")
            .query({ name: "coke" }) // Test query
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an("array");
                expect(res.body[0].name).to.include("coke");
                done();
            });
    });

    it("should return an empty array for a non-matching query", (done) => {
        chai.request(app)
            .get("/search-beverage")
            .query({ name: "NonExistentBeverage" })
            .end((err, res) => {
                expect(res).to.have.status(200); // Expect 200, not 404
                expect(res.body).to.be.an("array").that.is.empty; // Empty array
                done();
            });
    });

    it("should return all beverages when no query is provided", (done) => {
        chai.request(app)
            .get("/search-beverage")
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an("array"); // Expect an array directly
                expect(res.body.length).to.be.greaterThan(0); // Ensure at least one beverage
                done();
            });
    });

    it("should return multiple beverages matching the query", (done) => {
        chai.request(app)
            .get("/search-beverage")
            .query({ name: "e" }) // Matches multiple beverages with "e" in the name
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an("array").that.is.not.empty;
                expect(res.body.length).to.be.greaterThan(1); // Ensure multiple matches
                done();
            });
    });

    it("should handle errors when writing to beverages.json", async () => {
        const mockObject = { name: "Test Beverage" };
        sinon.stub(fs, "writeFile").throws(new Error("Write error"));
    
        try {
            await writeJSON(mockObject, "utils/beverages.json");
        } catch (err) {
            expect(err.message).to.equal("Write error");
        }
    
        fs.writeFile.restore();
    });
    

    it("should read and parse the beverages.json file", async () => {
        const data = await readJSON("utils/beverages.json");
        expect(data).to.be.an("array");
    });

    it("should write a new object to beverages.json", async () => {
        const mockObject = { name: "New Beverage" };
    
        // Mock the file system
        const initialData = JSON.stringify([]);
        sinon.stub(fs, "readFile").resolves(initialData);
        sinon.stub(fs, "writeFile").resolves();
    
        const updatedData = await writeJSON(mockObject, "utils/beverages.json");
        expect(updatedData).to.be.an("array");
        expect(updatedData).to.deep.include(mockObject);
    
        // Restore mocks
        fs.readFile.restore();
        fs.writeFile.restore();
    });
    it("should return 500 if the JSON file is missing or invalid", (done) => {
        sinon.stub(fs, "readFile").throws(new Error("File not found"));
    
        chai.request(app)
            .get("/search-beverage")
            .end((err, res) => {
                expect(res).to.have.status(500);
                expect(res.body).to.have.property("message").that.equals("Unable to read beverage data. Please contact the administrator.");
                fs.readFile.restore(); // Restore original behavior
                done();
            });
    });
    
});
