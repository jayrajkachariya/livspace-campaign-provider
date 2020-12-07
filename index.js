// ID constants
const campaignModalWrapperID = "campaign-modal-wrapper";
const campaignModalID = "campaign-modal";
const campaignModalContentID = "campaign-modal-content";
const campaignModalButtonID = "campaign-modal-button";
const campaignModalCloseButtonID = "campaign-modal-close-button";
const campaignModalIconBottomFixedID = "campaign-modal-icon-bottom-fixed";
const lottiePlayerID = "lottie-player";
const logoContainerID = "logo-container";
let isModalOpenend = false;
let logo;

// Modal wrapper
let campaignModalWrapper = document.createElement("div");
campaignModalWrapper.id = campaignModalWrapperID;
campaignModalWrapper.classList.add("campaign-modal-wrapper");

// Modal itself with dark full screen background, we can close via ESC key press or clicking on dark area
let campaignModal = document.createElement("div");
campaignModal.id = campaignModalID;
campaignModal.classList.add("campaign-modal");

// Modal contents forward link button and close button
let campaignModalContent = document.createElement("div");
campaignModalContent.id = campaignModalContentID;
campaignModalContent.classList.add("campaign-modal-content");

// Modal forward link button
let campaignModalButton = document.createElement("button");
campaignModalButton.textContent = "Claim your gift";
campaignModalButton.id = campaignModalButtonID;
campaignModalButton.classList.add("campaign-modal-content-button");

// Modal close button
let campaignModalCloseButton = document.createElement("div");
campaignModalCloseButton.innerHTML = "&times;";
campaignModalCloseButton.id = campaignModalCloseButtonID;
campaignModalCloseButton.classList.add("campaign-modal-content-close");

// Navbar gift static icon without animation, hidden at the moment
let campaignModalIconStatic = document.createElement("a");
campaignModalIconStatic.style.visibility = "hidden";
campaignModalIconStatic.style.height = "54px";
campaignModalIconStatic.style.transition = ".3s";

// Appending modal contents and modal on body
campaignModalContent.append(campaignModalCloseButton, campaignModalButton);
campaignModal.appendChild(campaignModalContent);
campaignModalWrapper.appendChild(campaignModal);
document.body.appendChild(campaignModalWrapper);

// close modal on close button click
campaignModalCloseButton.onclick = function () {
  closeCampaignModal();
};

// close modal on ESC key press
document.onkeydown = function (evt = window.event) {
  if (evt.keyCode === 27) closeCampaignModal();
};

// close modal on click outside modal
window.onclick = function (event) {
  if (event.target == campaignModal) {
    closeCampaignModal();
  }
};

// Get logo
function getLogo() {
  let logoElement = document.getElementsByTagName("img");
  for (let i = 0; i < logoElement.length; i++) {
    if (logoElement[i].alt === "logo") {
      logo = logoElement[i];
      break;
    }
  }
}

// Top left corner logo animation
function addCampaignWrapper(logo_url) {
  if (logo) {
    let parent = logo.parentNode;
    let logoLottiePlayer = getLottiePlayer({
      src: logo_url,
      style: "width: 80px;height: 34px;transform: scale(3.5);float: right;",
      loop: true,
      autoplay: true,
      speed: 0.8,
    });
    let isLogoMounted = true;

    let wrapper = document.createElement("div");
    wrapper.id = logoContainerID;
    wrapper.style.animationDuration = "3s";
    wrapper.classList.add("animate-fade-in-out");

    parent.replaceChild(wrapper, logo);
    wrapper.appendChild(logo);

    wrapper.addEventListener("animationiteration", function () {
      wrapper.classList.remove("animate-fade-in-out");
      if (isLogoMounted) {
        wrapper.style.animationDuration = "8s";
        wrapper.replaceChild(logoLottiePlayer, logo);
        isLogoMounted = !isLogoMounted;
      } else {
        wrapper.style.animationDuration = "3s";
        wrapper.replaceChild(logo, logoLottiePlayer);
        isLogoMounted = !isLogoMounted;
      }
      void this.offsetWidth;
      wrapper.classList.add("animate-fade-in-out");
    });
  }
}

// Background animation, if any
function addBodyBackgroundAnimation(background_url) {
  document.body.style.backgroundImage = `url(${background_url})`;
  setTimeout(() => {
    document.body.style.backgroundColor = "#fff";
    document.body.style.backgroundImage = "";
  }, 10000);
}

// Finding campaign through api call
async function findCampaign(origin = window.location.origin) {
  if (typeof origin !== "string" && origin?.theme?.isCustom) {
    const {
      theme: { background_url, gift_url: gift_icon_url, logo_url },
    } = origin;
    if (background_url && background_url.includes(".gif")) {
      addBodyBackgroundAnimation(background_url);
    }

    if (logo_url && logo_url.includes(".json")) {
      addCampaignWrapper(logo_url);
    }

    if (gift_icon_url.includes(".json")) {
      loadCampaign(gift_icon_url);
      window.addEventListener("scroll", hideCampaignBottomIconOnWindowScroll);
    }
  } else {
    let response = await fetch(
      `https://campaign-service.herokuapp.com/api/v1/campaigns?source_url=${origin}&status=active`
    );
    let data = await response.json();
    if (data.status === "success" && data.data && data.data.length) {
      const {
        gift_required,
        destination_url,
        gift_url,
        theme: { background_url, gift_url: gift_icon_url, logo_url },
      } = data.data[0];

      if (gift_required) {
        let lottiePlugin = document.getElementById(lottiePlayerID);
        if (lottiePlugin && gift_icon_url && gift_url && destination_url) {
          if (gift_icon_url.includes(".json")) {
            loadCampaign(gift_icon_url, gift_url, destination_url);
            window.addEventListener(
              "scroll",
              hideCampaignBottomIconOnWindowScroll
            );
          }
        }
      }

      if (background_url && background_url.includes(".gif")) {
        addBodyBackgroundAnimation(background_url);
      }

      if (logo_url && logo_url.includes(".json")) {
        addCampaignWrapper(logo_url);
      }
    }
  }
}

// Loading campaign if any gift offer available
function loadCampaign(giftIconUrl, campaignImageURL, campaignDestinationURL) {
  addCampaignIconBottomFixed(giftIconUrl, campaignImageURL);
  if (campaignDestinationURL) {
    campaignModalButton.onclick = function () {
      window.open(campaignDestinationURL);
    };
  }
}

// Adding campaign gift buttons static top in nav-bar and dynamic bottom fixed
function addCampaignIconBottomFixed(giftIconUrl, campaignImageURL) {
  // dynamic gift icon at bottom fix
  let campaignModalIconBottomFixed = document.createElement("div");
  campaignModalIconBottomFixed.id = campaignModalIconBottomFixedID;
  campaignModalIconBottomFixed.classList.add("campaign-icon-fixed-bottom");

  let giftLottieIcon = getGiftLottieIcon({
    src: giftIconUrl,
    style: "width: 100px; height: 100px; transform: scale(1.5)",
    loop: true,
    autoplay: true,
    speed: 0.8,
  });

  if (campaignImageURL) {
    giftLottieIcon.onclick = function () {
      isModalOpenend = true;
      openCampaignModal(campaignImageURL);
      hideDynamicCampaignIcon();
    };
  }

  campaignModalIconBottomFixed.appendChild(giftLottieIcon);
  document.body.appendChild(campaignModalIconBottomFixed);

  // Static gift icon in navbar
  let giftLottieIconStatic = getGiftLottieIcon({
    src: giftIconUrl,
    style: "width: 54px; height: 54px; margin-right: -10px",
    loop: false,
    autoplay: false,
    speed: 0.8,
  });

  if (campaignImageURL) {
    giftLottieIconStatic.onclick = function () {
      isModalOpenend = true;
      openCampaignModal(campaignImageURL);
      hideDynamicCampaignIcon();
    };
  }

  let firstMarginAutoElement = document.getElementsByClassName("ml-auto")[0];

  firstMarginAutoElement.parentNode.insertBefore(
    campaignModalIconStatic,
    firstMarginAutoElement
  );

  campaignModalIconStatic.appendChild(giftLottieIconStatic);
  firstMarginAutoElement.classList.remove("ml-auto");
  firstMarginAutoElement.classList.add("ml-8");
  campaignModalIconStatic.classList.add("ml-auto");
}

// On open campaign modal
function openCampaignModal(campaignImageURL) {
  isModalOpenend = true;
  campaignModalContent.style.backgroundImage = `url(${campaignImageURL})`;
  campaignModalWrapper.style.display = "flex";
  document.body.style.overflow = "hidden";
}

// On close campaign modal
function closeCampaignModal() {
  campaignModalWrapper.style.display = "none";
  document.body.style.overflow = "auto";
}

// Returns lottie animation wrapped in button as per, lottieConfig.
function getGiftLottieIcon(lottieConfig) {
  let lottiePlayer = getLottiePlayer(lottieConfig);
  let lottiePlayerWrapper = document.createElement("button");
  lottiePlayerWrapper.classList.add("lottie-player-wrapper");
  lottiePlayerWrapper.style.background = "transparent";
  lottiePlayerWrapper.appendChild(lottiePlayer);
  return lottiePlayerWrapper;
}

// Returns <lottie-player>...</lottie-player>
function getLottiePlayer({
  src,
  background = "transparent",
  speed = "1",
  style = "width: 100px; height: 60px;",
  loop = false,
  autoplay = false,
}) {
  let lottiePlayer = document.createElement("lottie-player");
  lottiePlayer.src = src;
  lottiePlayer.background = background;
  lottiePlayer.speed = speed;
  lottiePlayer.style = style;
  if (loop) lottiePlayer.setAttribute("loop", "");
  if (autoplay) lottiePlayer.setAttribute("autoplay", "");
  return lottiePlayer;
}

// Adding lottie script from CDN
async function importLottie() {
  const lottiePlayer = document.createElement("script");
  lottiePlayer.setAttribute("defer", "");
  lottiePlayer.src =
    "https://unpkg.com/@lottiefiles/lottie-player@0.4.0/dist/lottie-player.js";
  lottiePlayer.id = lottiePlayerID;
  await document.head.appendChild(lottiePlayer);
}

// Switch to static and dynamic gift icons, respectively on nav-bar and bottom fixed
function hideCampaignBottomIconOnWindowScroll() {
  if (isModalOpenend) {
    hideDynamicCampaignIcon();
  } else if (
    document.body.scrollTop > 50 ||
    document.documentElement.scrollTop > 50
  ) {
    hideDynamicCampaignIcon();
  } else {
    document.getElementById(campaignModalIconBottomFixedID).style.display =
      "block";
    campaignModalIconStatic.style.height = "54px";
    campaignModalIconStatic.style.visibility = "hidden";
  }
}

// To hide bottom dynamic icon
function hideDynamicCampaignIcon() {
  document.getElementById(campaignModalIconBottomFixedID).style.display =
    "none";
  campaignModalIconStatic.style.height = "auto";
  campaignModalIconStatic.style.visibility = "visible";
}

// To force stop animation
function stopCampaignAnimation() {
  let logoContainer = document.getElementById(logoContainerID);
  if (logoContainer.firstChild != logo) {
    logoContainer.replaceChild(logo, logoContainer.firstChild);
  }
  logoContainer.removeAttribute("class");
  logoContainer.removeAttribute("style");
  document.body.style.backgroundImage = "";
  document.getElementById(campaignModalIconBottomFixedID).remove();
  campaignModalIconStatic.style.visibility = "hidden";
}

// Initialization of script
function initiateLivspaceThemeChannel() {
  importLottie();
  getLogo();
  findCampaign();
}

window.previewTheme = findCampaign;
window.stopPreviewTheme = stopCampaignAnimation;

// Call of Initialization of script!
window.addEventListener("load", initiateLivspaceThemeChannel);
