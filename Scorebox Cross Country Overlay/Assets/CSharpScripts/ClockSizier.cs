using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class ClockSizier : MonoBehaviour
{

    public TextMeshProUGUI eventTitle;
    public TextMeshProUGUI eventTag;
    public float tagHeight = 24;
    public RawImage border;
    public float borderHeight = 48;

    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        border.GetComponent<RectTransform>().sizeDelta = new Vector2(eventTitle.renderedWidth + 148, borderHeight);
        eventTag.GetComponent<RectTransform>().sizeDelta = new Vector2(eventTitle.renderedWidth, tagHeight);
    }
}
