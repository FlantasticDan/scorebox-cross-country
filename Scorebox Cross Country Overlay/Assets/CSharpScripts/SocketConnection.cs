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
    public int max_entries = 13;

    void Start()
    {
        Application.runInBackground = true;
        // timekeeper = new Dictionary<string, string>();
        timekeeper.Add("display", "0:00");
        timekeeper.Add("title", "Event Title");
        timekeeper.Add("tag", "Event Tag");

        GeneratePlacements();

        var ws = new WebSocket ("ws://127.0.0.1:5500");

        ws.OnOpen += (sender, e) => {
            Debug.Log("Socket Connection Opened");
        };

        ws.OnMessage += (sender, e) => {
            // Debug.Log("Socket Message");
            Dictionary<string, string> payload = JsonConvert.DeserializeObject<Dictionary<string, string>>(e.Data);
            // Debug.Log(payload["mode"]);
            if (payload["mode"] == "clock") {
                ProcessClockMode(payload);
            }
            if (payload["mode"] == "placement") {
                ProcessPlacementMode(payload);
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
            }
        };
    }
}
