using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;

public class HeadingHandler : MonoBehaviour
{
    // Start is called before the first frame update

    public SocketConnection socket;
    public GameObject conatiner;
    public TextMeshProUGUI heading;
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        if (socket.placementkeeper["header"] != "0") {
            conatiner.SetActive(true);
            heading.text = socket.placementkeeper["header"];
        }
        else {
            conatiner.SetActive(false);
        }

    }
}
