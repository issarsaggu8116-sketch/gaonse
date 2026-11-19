import React, { useEffect } from "react";
import { WebView } from "react-native-webview";
import { Alert, Platform } from "react-native";

const RazorpayWebScreen = ({
  route,
  navigation,
}) => {
  const { order, amount, razorpayKey } =
    route.params;

  const html = `
<!DOCTYPE html>
<html>

<head>
<meta charset="utf-8" />
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
</head>

<body>

<h2>GAON SE PAYMENT</h2>

<script>

function sendLog(msg){
  try{
    var data = JSON.stringify({
      type:"debug",
      message:msg
    });
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(data);
    } else {
      window.parent.postMessage(data, "*");
    }
  }catch(e){}
}

sendLog("HTML LOADED");

window.onerror = function(
  message,
  source,
  lineno,
  colno,
  error
){
  sendLog(
    "JS ERROR: " + message
  );
  return true;
};

sendLog(
  "CHECKING RAZORPAY"
);

if(typeof Razorpay === "undefined"){
  sendLog(
    "RAZORPAY NOT LOADED"
  );
}else{
  sendLog(
    "RAZORPAY LOADED"
  );
}

var options = {
  key: "${razorpayKey || 'rzp_test_SxtSy55n70ETtB'}",
  amount: "${order.amount}",
  currency: "INR",
  name: "GAON SE",
  description: "Wallet Recharge",
  order_id: "${order.id}",
  redirect:false,
  handler:function(response){
      sendLog("ORDER ID: ${order.id}");
      sendLog("AMOUNT: ${order.amount}");
      var data = JSON.stringify({
        type:"success",
        data:response
      });
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(data);
      } else {
        window.parent.postMessage(data, "*");
      }
  },
  modal: {
    escape: false,
    backdropclose: false,
    ondismiss:function(){
      sendLog("CHECKOUT CLOSED");
      var data = JSON.stringify({
        type:"dismiss"
      });
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(data);
      } else {
        window.parent.postMessage(data, "*");
      }
    }
  }
};

sendLog(
  "CREATING INSTANCE"
);

var rzp =
  new Razorpay(options);

rzp.on(
  'payment.failed',
  function(response){
      sendLog(
        "PAYMENT FAILED"
      );
      sendLog(
        JSON.stringify(
          response.error
        )
      );
      var data = JSON.stringify({
        type:"failed",
        data:response.error
      });
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(data);
      } else {
        window.parent.postMessage(data, "*");
      }
  }
);

sendLog(
  "OPENING CHECKOUT"
);

rzp.open();

setTimeout(()=>{

  sendLog(
    "5 SECOND TEST MESSAGE"
  );

},5000);

</script>

</body>
</html>
`;

  useEffect(() => {
    if (Platform.OS === "web") {
      const handleWebMessage = (event) => {
        let result;
        try {
          result = JSON.parse(event.data);
        } catch {
          return;
        }

        if (result.type === "success") {
          navigation.replace("PaymentSuccess", {
            paymentData: result.data,
            amount,
          });
        } else if (result.type === "failed") {
          Alert.alert(
            "Payment Failed",
            "Your payment could not be completed. Please try again."
          );
          navigation.goBack();
        } else if (result.type === "dismiss") {
          navigation.goBack();
        }
      };

      window.addEventListener("message", handleWebMessage);
      return () => window.removeEventListener("message", handleWebMessage);
    }
  }, [navigation, amount]);

  if (Platform.OS === "web") {
    return (
      <iframe
        srcDoc={html}
        style={{ width: "100%", height: "100%", border: "none" }}
      />
    );
  }

  return (
    <WebView
      originWhitelist={["*"]}
      source={{ html }}
      javaScriptEnabled
      domStorageEnabled
      onMessage={(event) => {
        let result;
        try {
          result = JSON.parse(event.nativeEvent.data);
        } catch {
          return;
        }

        if (result.type === "success") {
          navigation.replace("PaymentSuccess", {
            paymentData: result.data,
            amount,
          });
        }

        if (result.type === "failed") {
          Alert.alert(
            "Payment Failed",
            "Your payment could not be completed. Please try again."
          );
          navigation.goBack();
        }

        if (result.type === "dismiss") {
          navigation.goBack();
        }
      }}
    />
  );
};

export default RazorpayWebScreen;