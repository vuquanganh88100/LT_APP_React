import { getRequest, postRequest, putRequest } from "../config/apiCaller";
import { apiPath } from "../config/apiPath";

export const taskService = {
    getTask: (userId, successCallback, errorCallback) => {
        console.log("Fetching tasks for user:", userId);
        
        // Make API request with the userId as a parameter
        return getRequest(
            `${apiPath.getTask}?userId=${userId}`,
            {},
            successCallback,
            errorCallback
        );
    },
    
    addTask: (taskData, successCallback, errorCallback) => {
        console.log("Adding new task:", taskData);
        
        // Make API request to add a new task
        return postRequest(
            apiPath.getTask, // Assuming the same endpoint is used for POST
            taskData,
            successCallback,
            errorCallback
        );
    },
    
    updateTask: (taskData, successCallback, errorCallback) => {
        console.log("Updating task:", taskData);
        
        // Make API request to update an existing task
        return putRequest(
            `${apiPath.getTask}/${taskData.taskId}`,
            taskData,
            successCallback,
            errorCallback
        );
    }
}