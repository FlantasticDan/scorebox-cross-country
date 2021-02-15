using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using WebSocketSharp;

public class SocketTester : MonoBehaviour
{
    // Start is called before the first frame update
    void Start()
    {
        var ws = new WebSocket ("ws://127.0.0.1:5500");

        ws.OnOpen += (sender, e) => {
            Debug.Log("OPEND");
        };

        ws.Connect ();
    }

    // Update is called once per frame
    void Update()
    {
        
    }
}
