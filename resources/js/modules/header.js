new Vue({
    el: ".js-header-vue",
    data() {
        return {
            scrollPosition: 0,
            isOpenLang: false,
            isOpenMobileNav: false,
            searchValue: "",
            searchedCategories: [],
            searchedProducts: [],
            searchedResultsCount: null,
            isLoaded: false
        }
    },
    methods: {
      updateScroll () {
        this.scrollPosition = window.scrollY;
      },
      focusSearch () {
        this.$refs.search.focus();
      },
      clearSearch () {
        this.searchValue = "";
        this.isLoaded = false;
        this.searchedCategories = [];
        this.searchedProducts = [];
        this.searchedResultsCount = null;
      },
      setLocale (language) {
        this.$i18n.locale = language;
        this.$router.push({ params: { lang: language } });
        this.isOpenLang = false;
      },
    scrollUp () {
        window.scrollTo({ top: 0, behavior: "smooth" });
    },
      openCart () {
        this.$store.commit("TOGGLE_CART", true);
    },
    searchRequest (searchTerm) {
        if (searchTerm === "") {
            this.clearSearch();
            return;
        }

        if (this.timeout) clearTimeout(this.timeout);

        this.isLoaded = false;

        this.timeout = setTimeout(() => {
          this.$http.post("/api/search",
          {
            query: searchTerm
          })
          .then(response => {
            if (response.status == 200 && response.data.status == 'success') {
              this.searchedCategories = response.data.categories;
              this.searchedProducts = response.data.products;
              this.searchedResultsCount = response.data.resultsCount;
              this.isLoaded = true;
            }
          })
          .catch(err => {
            if (err.response.status == 400) {
              this.showErrorModal(this.$t('errors.wrong_data'));
            }
            else if (err.response.status == 422) {
              this.showErrorModal(this.$t('errors.unprocessable_data'));
            }
            else {
              this.showErrorModal(this.$t('errors.common_error'));
            }
          });
        }, 1500);
      }
    },
    watch: {
        "$route": function() {
        this.isOpenMobileNav = false;
        this.clearSearch();
      }
    },
    mounted() {
      window.addEventListener('scroll', this.updateScroll);
      document.addEventListener('click', (event) => {
        // Close the language switcher if user clicks outside of it
        if (event.target.closest('.js-lang-switcher')) return;
        this.isOpenLang = false;
        // Close the mobile nav menu if the user clicks outside of it
        if (event.target.closest('.js-hamburger-menu')) return;
        if (event.target.closest('.js-mobile-menu')) return;
        this.isOpenMobileNav = false;
      });
    }
});
