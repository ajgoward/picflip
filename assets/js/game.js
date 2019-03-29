$(document).ready(function() {

    // Variables 

    const carsCardsArray = ["cruz", "lightning", "mater", "jackson-storm", "doc", "mac", "fillmore", "sally"];
    const frozenCardsArray = ["elsa", "anna", "olaf", "kristoff", "hans", "sven", "elsa-anna", "olaf-sven"];
    const toystoryCardsArray = ["woody", "buzz", "rex", "alien", "jessie", "potato", "lotso", "bullseye"];
    let displayCardsArray = [];
    let activeCardsArray = carsCardsArray;

    let silence = false;

    let flipCounter = 0;
    let turnsCounter = 0;
    let countSelected = 0;

    let userName = localStorage.getItem("userName");
    let userAvatar = localStorage.getItem("userAvatar");

    let easyScore = 0;
    let mediumScore = 0;
    let hardScore = 0;
    let activeScore = 0;

    let easyHighScore = 0;
    let mediumHighScore = 0;
    let hardHighScore = 0;
    let activeHighScore = hardHighScore;

    const dashStar = 'dashboard-score-star';
    const winStar = 'score-star';
    const highWinStar = 'win-modal-score-star';

    /**
     * Checks if there is data stored locally.
     * if no data, or data has been reset: 
     * then launches modal to collect user data
     * background on user data modal can't be clicked away, input must be given first.
     * if user data is present, it sets the variables and displays the applicable data on screen
     **/

    function checkForUserData() {
        if ((userAvatar === "default-avatar") || (userName === null)) {
            setTimeout(function() {
                $("#userInfoModal").modal({
                    backdrop: 'static',
                    keyboard: false
                })
            }, 500)
        }
        else {
            userName = localStorage.getItem("userName");
            userAvatar = localStorage.getItem("userAvatar");

            $('.avatar').attr('title').split().pop();
            $('.avatar').attr('title', userAvatar);

            // Bug fix: uninitialised high scores on reload of page caused high score stars to display incorrectly, these isNaN checks fixed it.
            if (isNaN(localStorage.getItem("easyHighScore"))) {
                easyHighScore = 0;
            }
            else {
                easyHighScore = localStorage.getItem("easyHighScore");
            }

            if (isNaN(localStorage.getItem("mediumHighScore"))) {
                mediumHighScore = 0;
            }
            else {
                mediumHighScore = localStorage.getItem("mediumHighScore");
            }

            if (isNaN(localStorage.getItem("hardHighScore"))) {
                hardHighScore = 0;
            }
            else {
                hardHighScore = localStorage.getItem("hardHighScore");
            }

            activeHighScore = hardHighScore;
            return;
        }
    }

    // play button click audio on all button elements
    $('.btn').click(function() {
        playButtonAudio();
    })

    function playButtonAudio() {
        $('#buttonClickAudio')[0].currentTime = 0;
        $('#buttonClickAudio')[0].play();
    }

    // style selection buttons
    $('.cars-cover').click(function() {
        styleButton(carsCardsArray);
    })

    $('.frozen-cover').click(function() {
        styleButton(frozenCardsArray);
    })

    $('.toystory-cover').click(function() {
        styleButton(toystoryCardsArray);
    })

    function styleButton(arr) {
        activeCardsArray = arr;
        resetGame();
    }

    // difficulty selection buttons
    $('#easyButton').click(function() {
        easyButton();
        difficultyButton(easyHighScore);
    })

    $('#mediumButton').click(function() {
        mediumButton();
        difficultyButton(mediumHighScore);
    })

    $('#hardButton').click(function() {
        hardButton();
        difficultyButton(hardHighScore);
    })

    function easyButton() {
        $('.my-card-column-medium, .my-card-column-hard').addClass('invisible').removeClass('visible');
        $('#dashboard-high-score-text').text('Easy mode high score');
    }

    function mediumButton() {
        $('.my-card-column-medium').addClass('visible').removeClass('invisible');
        $('.my-card-column-hard').addClass('invisible').removeClass('visible');
        $('#dashboard-high-score-text').text('Medium mode high score');
    }

    function hardButton() {
        $('.my-card-column-medium').addClass('visible').removeClass('invisible');
        $('.my-card-column-hard').addClass('visible').removeClass('invisible');
        $('#dashboard-high-score-text').text('Hard mode high score');
    }

    function difficultyButton(score) {
        activeHighScore = score;
        displayScore(activeHighScore, dashStar);
        resetGame();
    }

    // Reset button
    $('.reset-btn').click(function() {
        resetGame();
    })

    // Modal buttons
    $('#win-modal-close-btn').click(function() {
        resetGame();
        $('#winModal').modal('hide');
    })

    $('#high-score-modal-close-btn').click(function() {
        resetGame();
    })

    /**
     * resetGame() resets game, but not difficulty level or style selections
     * flips all face-up cards back over,
     * makes a new pack of cards, size depending on difficulty setting
     * delays new cards being displayed until cards have flipped back over
     * resets counters, and finally displays turns counter on screen.
     *
     **/

    function resetGame() {
        $('.face-up').addClass('face-down').removeClass('face-up disabled matched selected');
        let num = howManyCards();
        let cards = makeCardPack(activeCardsArray, num);
        setTimeout(function() {
            displayCards(cards);
        }, 500);
        flipCounter = 0;
        turnsCounter = 0;
        countSelected = 0;
        countTurns();
    }

    // Mute button
    $('#muteButton').click(function() {
        muteAudio();
    });

    // mute audio function, original code from: https://css-tricks.com/forums/topic/mute-unmute-sounds-on-website/
    function muteAudio() {

        let allaudio = document.getElementsByTagName('audio');

        if (silence) {
            for (let j = 0; j < allaudio.length; j++) {
                allaudio[j].muted = false;
            }
            silence = false;
        }
        else {
            for (let j = 0; j < allaudio.length; j++) {
                allaudio[j].muted = true;
            }
            silence = true;
        }
        $('#muteButton i').toggleClass('fa-volume-off');
    }

    $('#user-info-submit-button').click(function() {
        userInfoSubmitButton();
    });

    $('#deleteDataModal').click(function() {
        launchParentModal();
    })

    $('#confirmResetData').click(function() {
        resetUserData();
    })

    // Footer tab open on click
    $('#pullUpTab').click(function() {
        $('#footerTabContainer').toggleClass('active-footer');
    })

    /**
     * userInfoSubmitButton() collects data from the user info modal and assigns to the correct variables
     * it will only close modal if both username and avatar have been chosen
     **/

    function userInfoSubmitButton() {
        userName = $('#username').val();
        userAvatar = $('input[name=avatarRadios]:checked').val();

        localStorage.setItem("userName", userName);
        localStorage.setItem("userAvatar", userAvatar);

        displayUserData()

        if ((userName && userAvatar) || ((userName != 'Player') && (userAvatar))) {
            $('#userInfoModal').modal('hide');
        }
    }

    function launchParentModal() {
        $('#infoModal').modal('hide');
        $('#parentCheckModal').modal('show');
    }

    /**
     * resteUserData() resets all user data, reinitialises all user data,
     * sets avatar attribute back to default, redisplays all user data, 
     * and then hides the modal associated with it.
     **/

    function resetUserData() {
        localStorage.setItem("easyHighScore", 0);
        localStorage.setItem("mediumHighScore", 0);
        localStorage.setItem("hardHighScore", 0);
        localStorage.setItem("userName", "Player");
        localStorage.setItem("userAvatar", "default-avatar");

        easyHighScore = localStorage.getItem("easyHighScore");
        mediumHighScore = localStorage.getItem("mediumHighScore");
        hardHighScore = localStorage.getItem("hardHighScore");
        userName = localStorage.getItem("userName");
        userAvatar = localStorage.getItem("userAvatar");

        $('.avatar').attr('title').split().pop();
        $('.avatar').attr('title', userAvatar);

        activeHighScore = hardHighScore;
        displayUserData();
        displayScore(activeHighScore, dashStar);

        $('#parentCheckModal').modal('hide');
        checkForUserData();
    }

    // flips cards over on click, only allows two clicks at a time. Fixes bug caused by clicking cards too fast. 
    // BUG FIX - has to remain inside a click-function for $(this) to work
    $('.flip-card').click(function() {

        if (checkCounter()) {
            $('#cardFlipAudio')[0].currentTime = 0;
            $('#cardFlipAudio')[0].play();
            if ($(this).hasClass('face-down')) {
                $(this).addClass('face-up disabled selected').removeClass('face-down');
            }
            checkMatch();
        }
    })

    /**
     * displayUserData() sets avatar title attribute, then checks for which avatar choice was made 
     * and changes html to display it in avatar box
    **/

    function displayUserData() {
        $('.username').text(userName);

        $('.avatar').attr('title').split().pop();
        $('.avatar').attr('title', userAvatar);

        switch (userAvatar) {
            case 'strawberry':
                $('.avatar').addClass('strawberry-cover').removeClass('avatar-default toycar-cover plant-cover');
                break;
            case 'car':
                $('.avatar').addClass('toycar-cover').removeClass('avatar-default strawberry-cover plant-cover');
                break;
            case 'plant':
                $('.avatar').addClass('plant-cover').removeClass('avatar-default strawberry-cover toycar-cover');
                break;
            case 'default':
                $('.avatar').addClass('avatar-default').removeClass('plant-cover strawberry-cover toycar-cover');
                break;
            default:
                break;
        }
    }

    /**
     * displayCards(cards) displays shuffled cards on the screen. 
     * first it finds the last class in html element and assigns it to lastClass
     * as we need to keep 'game-card' class, if that class is present then function adds it back in and adds the card from suffled array 
     * if game-card class is not present it simply adds the class from the shuffled cards array
     * lastly it adds the correct title attribute description to each html element, for screen readers.
    **/

    // displays shuffled cards on the screen
    function displayCards(cards) {
        $('.flip-card-back').each(function(i) {

            let lastClass = $(this).attr('class').split(' ').pop();

            if (lastClass == 'game-card') {
                $(this).addClass('game-card').addClass(cards[i]);
            }
            else {
                $(this).removeClass(lastClass).addClass(cards[i]);
            }

            $(this).attr('title').split().pop();
            $(this).attr('title', (cards[i]));

        });
    }

    // displays score stars in selected place
    function displayScore(numOfStars, className) {

        let StarElems = document.getElementsByClassName(className);

        for (let i = 0; i < numOfStars; i++) {
            if ($(StarElems[i]).hasClass('empty-star')) {
                $(StarElems[i]).addClass('win-star').removeClass('empty-star');
                $(StarElems[i]).attr('title').split().pop();
                $(StarElems[i]).attr('title', 'star');
            }
        }
        for (i = numOfStars; i < 5; i++) {
            if ($(StarElems[i]).hasClass('win-star')) {
                $(StarElems[i]).addClass('empty-star').removeClass('win-star');
                $(StarElems[i]).attr('title').split().pop();
                $(StarElems[i]).attr('title', 'no star');
            }
        }
    }
    
    /**
     * makeCardPack(arr, num) creates pack by cutting difficulty selection, then duplicating, shuffling then returning it.
     * it contains a loop to randomize doubleCardsArray and push the resulting data to displayCardsArray.
    **/

    function makeCardPack(arr, num) {

        let cutArray = cutDeck(arr, num);
        let doubleCardsArray = duplicateCards(cutArray);
        let shuffledCardsArray = [];

        for (i = 0; i < num * 2; i++) {
            let randIndex = Math.floor(Math.random() * doubleCardsArray.length);
            let rand = doubleCardsArray[randIndex];
            doubleCardsArray.splice(randIndex, 1);
            shuffledCardsArray.push(rand);
        }
        return shuffledCardsArray;
    }

    // finds how many cards are visible, returns number of images needed for new pack
    function howManyCards() {
        let num = document.getElementsByClassName('visible').length;
        let halfNum = (num / 2);
        return halfNum;
    }

    // cuts the deck for different difficulty levels
    function cutDeck(arr, num) {
        let cards = arr.slice(0, num);
        return cards;
    }

    // returns an array with element elem repeated twice.
    function duplicateCards(elem) {
        let arr = [];

        for (let i = 0; i < 2; i++) {
            arr = arr.concat(elem);
        };
        return arr;
    }

    // countTurns() counts flips, when 2 flips have been done the number of turns goes up by one.
    function countTurns() {
        let turnsCounted = ("Turns: " + turnsCounter);
        if ((flipCounter % 2) == 0) {
            turnsCounter++;
        }
        $('.turns-counter').text(turnsCounted);
    }
    
    /**
     * BUG FIX: clicking cards fast resulted in mutiple display issues. 
     * this function makes sure that only 2 cards can be selected at once.
    **/
    function checkCounter() {
        countSelected++;
        if (countSelected <= 2) {
            return true;
        }
        else {
            return false;
        }
    }

    /** 
     * checkMatch() checks if two cards selected match: 
     * leaves matched cards flipped over, disables them, then checks for win.
     * if not match is found, function flips unmatched cards back over.
     * delays flip so user can see what was on the card before it is turned over again.
    **/  
    function checkMatch() {

        if (document.getElementsByClassName('selected').length == 2) {
            let first = $('.selected').eq(0).find('.flip-card-back').attr('class');
            let second = $('.selected').eq(1).find('.flip-card-back').attr('class');

            if (first == second) {
                $('.selected').each(function(x) {
                    $(this).removeClass('selected').addClass('matched disabled');
                    countSelected = 0;
                    flipCounter++;
                    countTurns();
                    delayedCorrectSound();
                    checkForWin();
                    return;
                })
            }
            else {
                setTimeout(function() {
                    $('.selected').each(function(x) {
                        $(this).removeClass('face-up selected disabled').addClass('face-down');
                        countSelected = 0;
                        flipCounter++;
                        countTurns();
                    })
                }, 1000);
            }
        }
        else {
            return;
        }
    }

    // delays sound played when a correct match is found
    function delayedCorrectSound() {
        setTimeout(function() {
            $('#correctBingAudio')[0].play();
        }, 600);
    }

    // gets score out of 5 based on difficulty level selected and turns taken to win.
    function checkScore() {

        let len = $('.visible').length;

        if (len === 8) {
            if (turnsCounter <= 7) {
                easyScore = 5;
                return 5;
            }
            else if (turnsCounter <= 9) {
                easyScore = 4;
                return 4;
            }
            else if (turnsCounter <= 11) {
                easyScore = 3;
                return 3;
            }
            else if (turnsCounter <= 13) {
                easyScore = 2;
                return 2;
            }
            else if (turnsCounter >= 15) {
                easyScore = 1;
                return 1;
            }
            else {
                return;
            }
        }
        else if (len === 12) {
            if (turnsCounter <= 13) {
                mediumScore = 5;
                return 5;
            }
            else if (turnsCounter <= 16) {
                mediumScore = 4;
                return 4;
            }
            else if (turnsCounter <= 19) {
                mediumScore = 3;
                return 3;
            }
            else if (turnsCounter <= 22) {
                mediumScore = 2;
                return 2;
            }
            else if (turnsCounter >= 24) {
                mediumScore = 1;
                return 1;
            }
            else {
                return console.log;
            }

        }
        else if (len === 16) {
            if (turnsCounter <= 14) {
                hardScore = 5;
                return 5;
            }
            else if (turnsCounter <= 18) {
                hardScore = 4;
                return 4;
            }
            else if (turnsCounter <= 22) {
                hardScore = 3;
                return 3;
            }
            else if (turnsCounter <= 26) {
                hardScore = 2;
                return 2;
            }
            else if (turnsCounter >= 30) {
                hardScore = 1;
                return 1;
            }
            else {
                return;
            }
        }
        else {
            return;
        }
    }

    /**
     * checkForWin() checks for when player has won. Works for all card pack sizes.
     * Checks if all visible cards have been turned over, 
     * then checks if player has a new high score. 
     * if yes, launches new high score modal if beats old score
     * if no, launches win modal
     * 
    **/
    function checkForWin() {
        let matchedNum = $('.matched').length;
        let visibleNum = $('.visible').length;

        if (matchedNum == visibleNum) {
            activeScore = checkScore();
            if (checkIfHighScore()) {

                delayDisplayModal('#newHighScoreModal');
                displayScore(activeHighScore, highWinStar);
                displayScore(activeHighScore, dashStar);
                return;
            }
            else {
                displayScore(activeScore, winStar);
                delayDisplayModal('#winModal');
                return;
            };
        }
        else {
            return;
        }
    }

    /**
     * delayDisplayModal(modalId) delays function so win modals do not pop up too early
     * BUG fix: moved delay into it's own function to prevent functions repeating when they shouldn't
    **/ 
    function delayDisplayModal(modalId) {
        setTimeout(function() {
            $(modalId).modal('show');
            $('#applauseAudio')[0].play();
        }, 1500);
    }

    // compares new score to highscore 
    function checkIfHighScore() {
        if (easyScore > easyHighScore) {
            easyHighScore = easyScore;
            activeHighScore = easyHighScore;
            localStorage.setItem("easyHighScore", easyHighScore);
            return true;
        }
        else if (mediumScore > mediumHighScore) {
            mediumHighScore = mediumScore;
            activeHighScore = mediumHighScore;
            localStorage.setItem("mediumHighScore", mediumHighScore);
            return true;
        }
        else if (hardScore > hardHighScore) {
            hardHighScore = hardScore;
            activeHighScore = hardHighScore;
            localStorage.setItem("hardHighScore", hardHighScore);
            return true;
        }
        else {
            return false;
        }
    }


    // default setting for cards when page is first loaded
    displayCardsArray = makeCardPack(carsCardsArray, 8);
    displayCards(displayCardsArray);
    countTurns();
    checkForUserData();
    displayUserData();
    displayScore(activeHighScore, dashStar);
})