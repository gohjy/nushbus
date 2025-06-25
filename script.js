history.scrollRestoration = "manual";

const stops = [
    {
        "code": 16991,
        "name": "Opp Nan Hua High Sch",
        "shortName": "Front Gate",
        "road": "Clementi Ave 1",
        "services": [
            "189"
        ]
    },
    {
        "code": 17191,
        "name": "NUS High Sch",
        "shortName": "Back Gate (Near)",
        "road": "AYE Slip Road",
        "services": [
            "188",
            "189",
            "196"
        ]
    },
    {
        "code": 17129,
        "name": "Aft NUS High Sch",
        "shortName": "Back Gate (Middle)",
        "road": "AYE (City)",
        "services": [
            "197",
            "198",
            "97",
            "97e",
            "963"
        ]
    },
    {
        "code": 17121,
        "name": "Blk 610",
        "shortName": "Back Gate (Far)",
        "road": "AYE (Tuas)",
        "services": [
            "97",
            "97e",
            "188",
            "196",
            "197",
            "198",
            "963"
        ]
    }
];

const sortBySvcRaw = (a, b) => {
    const toUniqueOrder = numberStr => {
        numberStr = numberStr.toString().trim();
        const svcNumberOnly = +numberStr.match(/^\d+/)[0];
        return svcNumberOnly * 27 + alphabet.indexOf(numberStr.slice(svcNumberOnly.toString().length).toLowerCase() || "*") + 1;
    }
    return toUniqueOrder(a) - toUniqueOrder(b);
}

const sortBySvc = (a, b) => {
    return sortBySvcRaw(a.no, b.no);
}

const alphabet = "abcdefghijklmnopqrstuvwxyz";

const dateToTime = (dateObj) => {
    const p = x => ((dateObj[`getUTC${x}`]()+(x==="Hours"?8:0))%24).toString().padStart(2, "0");
    return `${p("Hours")}:${p("Minutes")}:${p("Seconds")}`;
}

const getArrData = async (stopCode) => {
    if (typeof stopCode !== "number") return false;

    return await fetch(`https://arrivelah2.busrouter.sg/?id=${stopCode}`, {"cache": "reload"})
    .then(x => x.json())
    .catch(() => false);
}

const newElem = x => document.createElement(x);

const initPage = () => {
    const mainContainer = document.querySelector("#bus-timings");
    for (let stop of stops) {
        if (document.querySelector(`[data-stop-id="${stop.code}"]`)) continue;
        const stopDiv = document.createElement("div");
        stopDiv.dataset.stopId = stop.code;
        stopDiv.classList.add("stop-container");

        const stopHeader = document.createElement("h2");

        const stopCodeHolder = newElem("span");
        stopCodeHolder.textContent = stop.code;
        stopCodeHolder.classList.add("nobold");

        const stopNameHolder = newElem("span");
        stopNameHolder.textContent = stop.name;

        const stopMetaHolder = newElem("span");
        stopMetaHolder.textContent = `${stop.road} - ${stop.shortName}`;
        stopMetaHolder.classList.add("small", "nobold");

        stopHeader.append(
            stopCodeHolder,
            " ",
            stopNameHolder,
            newElem("br"),
            stopMetaHolder
        );

        const svcHolder = newElem("div");
        svcHolder.classList.add("service-holder");
        /* const tempLoading = newElem("span");
        tempLoading.classList.add("italic", "temp-loading");
        tempLoading.textContent = "Loading...";
        svcHolder.append(tempLoading); */

        for (let svc of stop.services.toSorted(sortBySvcRaw)) {
            if (!svcHolder.querySelector(`:scope [data-service="${svc}"]`)) {
                const svcCont = document.createElement("div");
                svcCont.classList.add("service-container");
                svcCont.dataset.service = svc;

                const svcId = document.createElement("span");
                svcId.classList.add("service-id");
                svcId.textContent = svc;

                svcCont.append(svcId);

                for (let i=1; i<=3; i++) {
                    const timeBox = document.createElement("span");
                    timeBox.classList.add("time-indicator");
                    timeBox.textContent = "";
                    timeBox.dataset.busCount = ["next", "next2", "next3"][i - 1];
                    svcCont.append(timeBox);
                }

                svcHolder.append(svcCont);
            }
        }

        stopDiv.append(stopHeader, svcHolder);
        mainContainer.append(stopDiv);
    }
}

const loadData = async () => {
    if (!document.querySelector(".stop-container")) initPage();

    const setClass = (elem, cls) => {
        for (let clsName of ["seat", "stand", "no"]) elem.classList.toggle(clsName, clsName === cls);
    }

    const milToMins = (mils) => Math.floor(mils / 1000 / 60);

    for (let stop of stops) {
        const stopBox = document.querySelector(`[data-stop-id="${stop.code}"]`);
        const svcHolder = stopBox.querySelector(":scope .service-holder");

        const data = await getArrData(stop.code);
        console.log(data);

        if (!data) {
            alert("Something went wrong! Check your network connection. (Or you might be reloading too fast.)");
            return false;
        }

        // svcHolder.querySelector(":scope .temp-loading")?.remove();

        const dataSource = stop.services.length > 0 ? stop.services.toSorted(sortBySvcRaw) : data.services.toSorted(sortBySvc).map(x => x.no);
        

        for (let svc of dataSource) {
            console.log(svc);

            /* if (svcHolder.querySelector(`:scope a [data-service="${svc.no}"]`)) {
                const svcCont = document.createElement("div");
                svcCont.classList.add("service-container");
                svcCont.dataset.service = svc.no;
                // svcCont.style.order = svcNumberOnly * 27 + alphabet.indexOf(svc.no.slice(svcNumberOnly.toString().length).toLowerCase() || "*") + 1;

                const svcId = document.createElement("span");
                svcId.classList.add("service-id");
                svcId.textContent = svc.no;

                svcCont.append(svcId);

                for (let i=1; i<=3; i++) {
                    const timeBox = document.createElement("span");
                    timeBox.classList.add("time-indicator");
                    timeBox.textContent = "N/A";
                    timeBox.dataset.busCount = ["next", "next2", "next3"][i - 1];
                    svcCont.append(timeBox);
                }

                svcHolder.append(svcCont);
            } */

            const svcCont = svcHolder.querySelector(`:scope [data-service="${svc}"]`);

            /* for (let i=1; i<=3; i++) {
                const busCountId = ["next", "next2", "next3"][i - 1];
                if (svcCont.querySelector(`:scope [data-bus-count=${busCountId}]`)) continue;

                const timeBox = document.createElement("span");
                timeBox.classList.add("time-indicator");
                timeBox.textContent = "N/A";
                timeBox.dataset.busCount = ["next", "next2", "next3"][i - 1];
                svcCont.append(timeBox);
            } */

            for (let key of ["next", "next2", "next3"]) {
                const indicator = svcCont.querySelector(`:scope [data-bus-count=${key}]`);
                const svcArrData = data.services.find(x => x.no === svc);
                if (!svcArrData?.[key]?.time) {
                    setClass(indicator, "");
                    indicator.classList.add("no-data");
                    indicator.textContent = "N/A"
                    continue;
                }

                indicator.classList.remove("no-data")

                const comingTime = new Date(svcArrData[key].time);
                const offset = milToMins(Math.max(comingTime - new Date(), 0));

                indicator.textContent = ((offset === 0) ? "Arr" : `${offset} min`);

                indicator.classList.toggle("unmonitored-schedule", !svcArrData[key].monitored);
                
                setClass(indicator, {"SEA":"seat","SDA":"stand","LSD":"no"}[svcArrData[key].load]);
            }
        }
    }

    document.querySelector("#last-update").textContent = "Last updated " + dateToTime(new Date()) + " SGT";
}

initPage();
loadData();
setInterval(loadData, 30000);