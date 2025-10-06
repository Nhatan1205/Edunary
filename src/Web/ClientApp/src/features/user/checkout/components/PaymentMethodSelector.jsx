import { Box, Typography, FormControl, RadioGroup, Paper, FormControlLabel, Radio } from "@mui/material"
import LockIcon from "@mui/icons-material/Lock"
import CreditCardIcon from "@mui/icons-material/CreditCard"
import { CardElement } from "@stripe/react-stripe-js"

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      lineHeight: '1.4375em',
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: true,
}

export default function PaymentMethodSelector({ paymentMethod, setPaymentMethod, error }) {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#1a1a1a" }}>
          Payment Method
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Secure and encrypted
          </Typography>
          <LockIcon sx={{ fontSize: 16, color: "text.secondary" }} />
        </Box>
      </Box>

      <FormControl component="fieldset" fullWidth>
        <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          {/* Card Payment with Stripe */}
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              mb: 2,
              border: paymentMethod === "card" ? "2px solid #6366f1" : "1px solid #e5e7eb",
              borderRadius: 2,
              backgroundColor: paymentMethod === "card" ? "#f8fafc" : "white",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              },
            }}
          >
            <FormControlLabel
              value="card"
              control={<Radio sx={{ "&.Mui-checked": { color: "#6366f1" } }} />}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                  <CreditCardIcon sx={{ color: "#6366f1" }} />
                  <Typography sx={{ fontWeight: 500 }}>Credit/Debit Cards</Typography>
                  <Box sx={{ display: "flex", gap: 0.5, ml: "auto" }}>
                    <Box
                      component="img"
                      src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg"
                      alt="Visa"
                      sx={{ width: 40, height: 25, objectFit: "contain" }}
                    />
                    <Box
                      component="img"
                      src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                      alt="Mastercard"
                      sx={{ width: 40, height: 25, objectFit: "contain" }}
                    />
                    <Box
                      component="img"
                      src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg"
                      alt="Amex"
                      sx={{ width: 40, height: 25, objectFit: "contain" }}
                    />
                  </Box>
                </Box>
              }
              sx={{ width: "100%", m: 0 }}
            />

            {paymentMethod === "card" && (
              <Box sx={{ mt: 3, pl: 4 }}>
                <Typography variant="body2" sx={{ mb: 2, color: "#666" }}>
                  Card Information
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    border: "1px solid #d1d5db",
                    borderRadius: 1,
                    backgroundColor: "white",
                    "&:focus-within": {
                      borderColor: "#6366f1",
                      boxShadow: "0 0 0 1px #6366f1",
                    },
                  }}
                >
                  <CardElement options={cardElementOptions} />
                </Box>
                {error && (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    {error}
                  </Typography>
                )}
              </Box>
            )}
          </Paper>

          {/* Google Pay */}
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              mb: 2,
              border: paymentMethod === "googlepay" ? "2px solid #6366f1" : "1px solid #e5e7eb",
              borderRadius: 2,
              backgroundColor: paymentMethod === "googlepay" ? "#f8fafc" : "white",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              },
            }}
          >
            <FormControlLabel
              value="googlepay"
              control={<Radio sx={{ "&.Mui-checked": { color: "#6366f1" } }} />}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    component="img"
                    src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg"
                    alt="Google Pay"
                    sx={{ width: 50, height: 20, objectFit: "contain" }}
                  />
                  <Typography sx={{ fontWeight: 500 }}>Google Pay</Typography>
                </Box>
              }
              sx={{ width: "100%", m: 0 }}
            />
          </Paper>

          {/* PayPal */}
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              border: paymentMethod === "paypal" ? "2px solid #6366f1" : "1px solid #e5e7eb",
              borderRadius: 2,
              backgroundColor: paymentMethod === "paypal" ? "#f8fafc" : "white",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              },
            }}
          >
            <FormControlLabel
              value="paypal"
              control={<Radio sx={{ "&.Mui-checked": { color: "#6366f1" } }} />}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    component="img"
                    src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
                    alt="PayPal"
                    sx={{ width: 70, height: 20, objectFit: "contain" }}
                  />
                  <Typography sx={{ fontWeight: 500 }}>PayPal</Typography>
                </Box>
              }
              sx={{ width: "100%", m: 0 }}
            />
          </Paper>
        </RadioGroup>
      </FormControl>
    </Box>
  )
}