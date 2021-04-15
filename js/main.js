/*!
 * Copyright 2013-2020 CommScope, Inc., All rights reserved.
 *
 * This program is confidential and proprietary to CommScope, Inc. (CommScope), and
 * may not be copied, reproduced, modified, disclosed to others, published or used, in
 * whole or in part, without the express prior written permission of CommScope.
 */

(function () {
  var notification1 = notificationManager.create({
    text: 'Challenge Accepted!',
    timeout: 5000
  });

  notification1.show();
  // notification1.hide()
  // setTimeout(() => {
  //   notification1.hide();
  // }, 5000)
  let keyDownCount = 0;
  var notification2;
  document.addEventListener('keydown', function (e) {
    var keyCode = e.keyCode;
    //Prevent the key press from bubbling up. The default behaviour for the spacebar is to scroll down the page.
    e.preventDefault();

    if (keyCode === 32 && ++keyDownCount === 4) {
      notification2 = notificationManager.create({
        text: 'Warning: Time is running out!',
        className: "warning",
        timeout: 3000
      })
      notification2.show();
      keyDownCount = 0;
      //console.log(notification1);
    } else if (keyCode === 32 && keyDownCount === 1 && notification2?.isVisible()) {
      notification2.hide();
      keyDownCount = 0;
      //keyDownCount--;
    }
    console.log(notification2);
  });
})();
