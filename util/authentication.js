function validateRegisterInput(username, email, password) {
    const error = {};

    if (username.trim() === "") {
        error.username = "Username must not be empty";
    }

    if (email.trim() === "") {
        error.email = "Email must not be empty";
    } else {
        const regEx =
            /^([0-9a-zA-z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[0-9a-zA-Z]{2,9})$/;
        if (!email.match(regEx)) {
            error.email = "Invalid email";
        }
    }

    if (password.trim() === "") {
        error.password = "Password must not be empty";
    }

    return {
        error,
        valid: Object.keys(error).length < 1
    };
}

function validateLoginInput(username, password) {
    const error = {};

    if (username.trim() === "") {
        error.username = "Username must not be empty";
    }

    if (password.trim() === "") {
        error.password = "Password must not be empty";
    }

    return {
        error,
        valid: Object.keys(error).length < 1
    };
}

module.exports = {
    validateRegisterInput,
    validateLoginInput
};
