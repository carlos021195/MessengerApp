import React from "react";

// Needs to be finished. Need to create component that will display the results or empty if none
const UserResults = ({searchResult}) => {
    console.log(searchResult)
    return(
        searchResult.length > 0 ? searchResult.map(result => {return <div>{result.title}</div>}) : <div>No users found</div>
    )
}
export default UserResults;