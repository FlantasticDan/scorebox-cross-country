using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class SplitHeadingSizer : MonoBehaviour
{
    public TextMeshProUGUI splitHeading;
    public RawImage splitHeadingBorder;
    public float borderHeight = 32;
    public RawImage splitHeaderBackground;
    public float bgHeight = 24;
    public TextMeshProUGUI splitDisclaimer;

    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        splitHeadingBorder.GetComponent<RectTransform>().sizeDelta = new Vector2(splitHeading.renderedWidth + 24 + splitDisclaimer.renderedWidth, borderHeight);
        splitHeaderBackground.GetComponent<RectTransform>().sizeDelta = new Vector2(splitHeading.renderedWidth + 8, bgHeight);
        Vector3 splitDisclaimerPosition =  splitDisclaimer.GetComponent<RectTransform>().localPosition;
        splitDisclaimer.GetComponent<RectTransform>().localPosition = new Vector3(splitHeading.renderedWidth + 16, splitDisclaimerPosition.y, splitDisclaimerPosition.z);
    }
}
