sap.ui.define([], function () {

    "use strict";
    return {

        monthValidate: function (sKey) {
            if (!sKey) {          // safety net

                return false;

            }

            const iCurrent = new Date().getMonth();   // 0 … 11 (Jan … Dec)

            const iPrev = (iCurrent + 11) % 12;    // wraps for January

            const iNext = (iCurrent + 1) % 12;    // wraps for December

            // "06" → 5, "12" → 11, …

            const iKey = parseInt(sKey, 10) - 1;
 
            return iKey === iPrev || iKey === iCurrent || iKey === iNext;

        },
        // formatDate: function (oDate) {
        //     if (!oDate) {
        //         return "";
        //     }
        //     return oDate.slice(6, 8) + '-' + oDate.slice(4, 6) + '-' + oDate.slice(0, 4);
        // },

        /* export the API */


    }

});
