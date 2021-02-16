using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class PlacementHandler : MonoBehaviour
{
    public SocketConnection socket;
    public int placementId;
    public GameObject conatiner;
    private string i;
    private Dictionary<string, string> placementkeeper;

    public TextMeshProUGUI placement;
    public TextMeshProUGUI team;
    public RawImage teamBG;
    public TextMeshProUGUI jersey;
    public TextMeshProUGUI runnerName;
    public TextMeshProUGUI timeDisplay;
    public ColorManager colors;


    // Start is called before the first frame update
    void Start()
    {
        // Debug.Log(socket.placementkeeper["0place"]);
        placementkeeper = socket.placementkeeper;
        i = placementId.ToString();
    }

    // Update is called once per frame
    void Update()
    {
        if (placementkeeper[i + "place"] != "0"){
            conatiner.SetActive(true);

            placement.text = placementkeeper[i + "place"];
            team.text = placementkeeper[i + "team"];
            jersey.text = placementkeeper[i + "jersey"];
            runnerName.text = placementkeeper[i + "name"];
            timeDisplay.text = placementkeeper[i + "display"];
            teamBG.color = GetColor(placementkeeper[i + "color"]);
        }
        else
        {
            conatiner.SetActive(false);
        }

    }

    Color GetColor(string color)
    {
        if (color == "red")
        {
            return colors.red;
        }

        if (color == "orange")
        {
            return colors.orange;
        }

        if (color == "yellow")
        {
            return colors.yellow;
        }

        if (color == "green")
        {
            return colors.green;
        }

        if (color == "blue")
        {
            return colors.blue;
        }

        if (color == "purple")
        {
            return colors.purple;
        }

        if (color == "gold")
        {
            return colors.gold;
        }

        if (color == "silver")
        {
            return colors.silver;
        }

        return colors.silver;
    }
}
