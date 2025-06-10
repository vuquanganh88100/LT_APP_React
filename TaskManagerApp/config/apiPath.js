export const API_PATH="/schedule-manager"
export const apiPath={
    login:API_PATH+"/auth/login",
    register:API_PATH+"/auth/register",
    //category API
    getAllCategory:API_PATH+"/category",
    addCategory:API_PATH+"/category/create",
    
    //taskAPI
    getTask:API_PATH+"/task",
    getTaskByDate:API_PATH+"/task/by-date",
    createTask:API_PATH+"/task/create"
}