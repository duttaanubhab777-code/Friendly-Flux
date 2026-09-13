/* Chemistry পেজের সব লজিক এখন ../shared.js-এ; এখানে শুধু নিজের ডেটা পাস করা হচ্ছে। */
document.addEventListener("DOMContentLoaded", () => {
    FriendlyFluxApp.init({
        formulas: chemistryFormulas,
        dictionary: dictionary,
        apiPath: "/api/chemistry/solve",
    });
});
