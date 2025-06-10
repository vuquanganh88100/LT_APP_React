import { getRequest, postRequest, putRequest } from "../config/apiCaller";
import { apiPath } from "../config/apiPath";

export const taskService = {
    getTask: (userId, successCallback, errorCallback) => {
        console.log("Fetching tasks for user:", userId);
        
        return getRequest(
            `${apiPath.getTask}?userId=${userId}`,
            {},
            successCallback,
            errorCallback
        );
    },
    
    addTask: (taskData, successCallback, errorCallback) => {
        console.log("Adding new task:", taskData);
        
        return postRequest(
            apiPath.createTask, 
            taskData,
            successCallback,
            errorCallback
        );
    },
    
    updateTask: (taskData, successCallback, errorCallback) => {
        console.log("Updating task:", taskData);
        
        return putRequest(
            `${apiPath.getTask}/${taskData.taskId}`,
            taskData,
            successCallback,
            errorCallback
        );
    }
}