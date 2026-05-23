// Renders the home page
const showHomePage = async (req, res, next) => {
    try {
        const title = 'Home';
        res.render('index', { title });
    } catch (error) {
        next(error);
    }
};

export { showHomePage };