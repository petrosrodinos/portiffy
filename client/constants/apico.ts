import { APICO_INTEGRATION_ID } from ".";

export const googleSheets = {
    feedBack: {
        sheetId: "12tWOa9IFcM6UHAFV1nPVvPMKO2-CeHXKY2ryQ_-1Oig",
        sheetName: "Sheet1",
    },
};

export const apicoUrls = {
    feedBack: `https://api.apico.dev/v1/${APICO_INTEGRATION_ID}/${googleSheets.feedBack.sheetId}`,
};