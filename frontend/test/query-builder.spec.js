describe("buildQuery test suite", function() {

    let queryFixtures = TTT.getQueryFixtures();

    let queryDescriptions = TTT.getQueryDescriptions();
    for (let queryName in queryFixtures) {
        if (queryFixtures.hasOwnProperty(queryName)) {

                it(`~Bee${queryName}~Should be able to build a ${queryDescriptions[queryName]}`, function() {
                    TTT.insertHtmlFixture(queryName);
                    debugger;
                    let actualQuery = CampusExplorer.buildQuery(document);
                    let expectedQuery = queryFixtures[queryName];
                    expect(actualQuery).to.equalQuery(expectedQuery);
                });
            }
        }
    }

});
