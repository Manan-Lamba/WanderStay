


const signupForm = (req, res) => {
    res.render("users/register");
};

const createUser = async (req, res, next) => {
    let { username, email, password } = req.body;
    const user = new User({
        email,
        username
    });

    const regUser = await User.register(user, password);
    console.log(regUser);
    req.login(regUser, (err) => {
        if (err) {
            return next(err);
        }
        req.flash("congratulation", "Welcome to WanderStay!");
        res.redirect("/listings");
    })
};

const loginForm = (req, res) => {
    res.render("users/login");
};

const login = (req, res) => {
        const goTo = req.session.returnTo || "/listings";
        delete req.session.returnTo;
        req.flash("congratulation", "Welcome back!");
        res.redirect(goTo);
    };

const logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("error", "You have been logged out.");
        res.redirect("/listings");
    });
};

module.exports = {
    signupForm,
    createUser,
    loginForm,
    login,
    logout
}