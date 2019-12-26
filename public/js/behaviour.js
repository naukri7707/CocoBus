// Banner Info
var banner = new Vue({
    el: '#banner',
    delimiters: ['{{', '}}'],
    data: {
        bannerData: [
            { src: '/img/banner-01.jpg', text: '我可以打文字我可以打文字我可以打文字' },
            { src: '/img/banner-02.jpg', text: '我可以打文字2我可以打文字2我可以打文字2' },
            { src: '/img/banner-01.jpg', text: '' },
        ],
    },
});

// Navbar show dropdown while hover
const $dropdown = $(".dropdown");
const $dropdownToggle = $(".dropdown-toggle");
const $dropdownMenu = $(".dropdown-menu");
const showClass = "show";

$(window).on("load resize", function () {
    if (this.matchMedia("(min-width: 768px)").matches) {
        $dropdown.hover(
            function () {
                const $this = $(this);
                $this.addClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "true");
                $this.find($dropdownMenu).addClass(showClass);
            },
            function () {
                const $this = $(this);
                $this.removeClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "false");
                $this.find($dropdownMenu).removeClass(showClass);
            }
        );
    } else {
        $dropdown.off("mouseenter mouseleave");
    }
});