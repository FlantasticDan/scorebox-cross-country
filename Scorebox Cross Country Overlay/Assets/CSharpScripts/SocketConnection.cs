using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using WebSocketSharp;
using Newtonsoft.Json;

public class SocketConnection : MonoBehaviour
{
    // Start is called before the first frame update
    public Dictionary<string, string> timekeeper = new Dictionary<string, string>();
    public Dictionary<string, string> placementkeeper = new Dictionary<string, string>();
    public Dictionary<string, bool> visibilitymanager = new Dictionary<string, bool>();
    public Dictionary<string, string> lowerthirdkeeper = new Dictionary<string, string>();
    public int max_entries = 13;

    void Start()
    {
        Application.runInBackground = true;
        // timekeeper = new Dictionary<string, string>();
        timekeeper.Add("display", "0:00");
        timekeeper.Add("title", "Event Title");
        timekeeper.Add("tag", "Event Tag");

        GeneratePlacements();

        visibilitymanager.Add("clock", true);
        visibilitymanager.Add("placement", true);
        visibilitymanager.Add("lower_third", false);

        lowerthirdkeeper.Add("title", "");
        lowerthirdkeeper.Add("subtitle", "");
        lowerthirdkeeper.Add("lower_third_mode", "one_liner");

        var ws = new WebSocket ("ws://127.0.0.1:5500");

        ws.OnOpen += (sender, e) => {
            Debug.Log("Socket Connection Opened");
        };

        ws.OnMessage += (sender, e) => {
            Dictionary<string, string> payload = JsonConvert.DeserializeObject<Dictionary<string, string>>(e.Data);

            if (payload["mode"] == "clock") {
                ProcessClockMode(payload);
            }
            if (payload["mode"] == "placement") {
                ProcessPlacementMode(payload);
            }
            if (payload["mode"] == "visibility") {
                ProcessVisibilityMode(payload);
            }
            if (payload["mode"] == "lower_third") {
                ProcessLowerThirdMode(payload);
            }
        };

        ws.Connect ();
    }

    // Update is called once per frame
    void Update()
    {

    }

    void ProcessClockMode(Dictionary<string, string> payload)
    {
        timekeeper["display"] = payload["display"];
        timekeeper["title"] = payload["title"];
        timekeeper["tag"] = payload["tag"];
    }

    void GeneratePlacements()
    {
        for (int i = 0; i < max_entries; i++)
        {
            string j = i.ToString();
            placementkeeper.Add(j + "place", "0");
            placementkeeper.Add(j + "team", "0");
            placementkeeper.Add(j + "jersey", "0");
            placementkeeper.Add(j + "name", "0");
            placementkeeper.Add(j + "display", "0");
            placementkeeper.Add(j + "color", "0");
        }

        placementkeeper.Add("header", "0");
    }

    void ProcessPlacementMode(Dictionary<string, string> payload)
    {
        placementkeeper["header"] = payload["heading"];
        for (int i = 0; i < max_entries; i++)
        {
            string j = i.ToString();
            placementkeeper[j + "place"] = payload[j + "place"];
            if (placementkeeper[j + "place"] != "0"){
                placementkeeper[j + "team"] = payload[j + "team"];
                placementkeeper[j + "jersey"] = payload[j + "jersey"];
                placementkeeper[j + "name"] = payload[j + "name"];
                placementkeeper[j + "display"] = payload[j + "display"];
                placementkeeper[j + "color"] = payload[j + "color"];
            }
        };
    }

    void ProcessVisibilityMode(Dictionary<string, string> payload)
    {
        visibilitymanager["clock"] = bool.Parse(payload["clock"]);
        visibilitymanager["placement"] = bool.Parse(payload["placement"]);
        visibilitymanager["lower_third"] = bool.Parse(payload["lower_third"]);
    }

    void ProcessLowerThirdMode(Dictionary<string, string> payload){
        lowerthirdkeeper["title"] = payload["title"];
        lowerthirdkeeper["subtitle"] = payload["subtitle"];
        lowerthirdkeeper["lower_third_mode"] = payload["lower_third_mode"];
    }
}
