// load JSON from local file
declare module "*.json"
{ const value: any;
export default value;
}

// load JSON from remote URL responses
declare module "json!*"
{ const value: any;
export default value;
}
