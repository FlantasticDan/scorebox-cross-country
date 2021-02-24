using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class VisibilityManager : MonoBehaviour
{
    public SocketConnection socket;
    private Dictionary<string, bool> visibilitymanager;
    public GameObject clockContainer;
    public GameObject splitContainer;
    public GameObject lowerThirdContainer;

    // Start is called before the first frame update
    void Start()
    {
        visibilitymanager = socket.visibilitymanager;
    }

    // Update is called once per frame
    void LateUpdate()
    {
        clockContainer.SetActive(visibilitymanager["clock"]);
        splitContainer.SetActive(visibilitymanager["placement"]);
        lowerThirdContainer.SetActive(visibilitymanager["lower_third"]);
    }
}
