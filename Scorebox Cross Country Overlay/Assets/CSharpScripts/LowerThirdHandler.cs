using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;

public class LowerThirdHandler : MonoBehaviour
{
    public SocketConnection socket;
    public TextMeshProUGUI oneLiner;
    public TextMeshProUGUI mainTitle;
    public TextMeshProUGUI subTitle;
    private Dictionary<string, string> lowerthirdkeeper;
    // Start is called before the first frame update
    void Start()
    {
        lowerthirdkeeper = socket.lowerthirdkeeper;
    }

    // Update is called once per frame
    void Update()
    {
        subTitle.text = lowerthirdkeeper["subtitle"];

        if (lowerthirdkeeper["lower_third_mode"] == "one_liner") {
            mainTitle.text = "";
            oneLiner.text = lowerthirdkeeper["title"];
        }
        else {
            mainTitle.text = lowerthirdkeeper["title"];
            oneLiner.text = "";
        }
    }
}
