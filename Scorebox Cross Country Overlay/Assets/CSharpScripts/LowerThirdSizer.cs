using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class LowerThirdSizer : MonoBehaviour
{
    public TextMeshProUGUI oneliner;
    public TextMeshProUGUI title;
    public TextMeshProUGUI subtitle;
    public RawImage background;
    public RawImage border;
    private float referenceWidth;
    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        referenceWidth = Mathf.Max(oneliner.renderedWidth, title.renderedWidth);
        referenceWidth = Mathf.Max(referenceWidth, subtitle.renderedWidth);

        border.GetComponent<RectTransform>().sizeDelta = new Vector2(referenceWidth + 24, 70);
        background.GetComponent<RectTransform>().sizeDelta = new Vector2(referenceWidth + 16, 62);
    }
}
