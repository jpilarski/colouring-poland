interface User {
    username?: string;
    email?: string;
    registered?: Date;
    has_api_key?: boolean;
    error?: string;
    // TODO: add other fields as needed
}

export {
    User
};
