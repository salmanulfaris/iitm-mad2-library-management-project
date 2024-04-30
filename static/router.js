import Home from "./components/Home.js";
import Login from "./components/Login.js";
import Register from "./components/Register.js";
import LibrarianLogin from "./components/LibrarianLogin.js";
import AllBooks from './components/AllBooks.js'
import AllSections from "./components/AllSections.js";
import BookRequests from "./components/BookRequests.js";
import ReadBook from "./components/ReadBook.js";
import SearchResult from "./components/SearchResult.js";
import ViewSection from "./components/ViewSection.js";
import EditBook from "./components/EditBook.js"
import AdminStat from "./components/AdminStat.js";
import MyRequests from "./components/MyRequests.js";
const routes = [
    {path: "/", component: Home, name: "Home"},
    {path: "/login", component: Login, name: "Login"},
    {path: "/register", component: Register,name:"Register"},
    {path: "/lib-login", component: LibrarianLogin,name: "LibrarianLogin"},
    {path: "/books", component: AllBooks, name: "AllBooks"},
    {path: "/sections", component: AllSections, name: "AllSection"},
    {path: "/requests", component: BookRequests, name: "BookRequests"},
    {path: "/read/:id", component: ReadBook, name: "ReadBook"},
    {path: "/section/:id", component: ViewSection, name: "ViewSection"},
    {path: "/edit-book/:id", component: EditBook, name: "EditBook"},
    {path: "/search-result", component: SearchResult,name:"SearchResult"},
    {path: "/admin-stat", component: AdminStat,name:"AdminStat"},
    {path: "/my-requests", component: MyRequests,name:"MyRequests"},
];

const router = new VueRouter({
    routes,

});

router.beforeEach((to, from, next) => {
    let isLoggedIn = localStorage.getItem("auth-token");
    const loginPages = ["LibrarianLogin","Register","Login"]
    if(loginPages.includes(to.name)){
        if(isLoggedIn){
            next({name:"Home"})
        }else {
            next()
        }
    }else {
        if(isLoggedIn){
            next()
        }else{
            next({name:"Login"})
        }
    }
    // if (to.name !== "Login" && !localStorage.getItem("auth-token") ? true : false)
    //   next({ name: "Login" });
    // else next();
    // next()
});

export default router;
