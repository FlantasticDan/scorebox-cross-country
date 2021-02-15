using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;

public class ClockHandler : MonoBehaviour
{
    // Start is called before the first frame update

    public SocketConnection socket;
    public TextMeshProUGUI clock_display;
    public TextMeshProUGUI event_title;
    public TextMeshProUGUI event_tag;
    private Dictionary<string, string> timekeeper;
    void Start()
    {
        timekeeper = socket.timekeeper;
    }

    // Update is called once per frame
    void Update()
    {
        clock_display.text = timekeeper["display"];
        event_tag.text = timekeeper["tag"];
        event_title.text = timekeeper["title"];
    }
}
