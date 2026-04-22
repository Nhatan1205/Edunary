import { Box } from '@mui/material';
import { Row, Col } from 'reactstrap';
import PageTitle from '../../../../components/PageTitle';
import MainCard from '../../../../components/instructor-layout/MainCard';
import AvailableBalance from './components/AvailableBalance';
import PaymentAccount from './components/PaymentAccount';
import WithdrawalForm from './components/WithdrawalForm';
import WithdrawalHistory from './components/WithdrawalHistory';
import useGetBasicUserInfo from '../../../../hooks/auth-hooks/useGetBasicUserInfor';

function RevenuePage() {
  const { data: user } = useGetBasicUserInfo();
  const isInfoEnough =
    String(user?.bankAccountHolder ?? "").trim() !== "" &&
    String(user?.bank ?? "").trim() !== "" &&
    String(user?.bankNumber ?? "").trim() !== "";

  return (
    <MainCard>
      <Box mb={4}>
        <PageTitle
          title="Revenue"
          subtitle="Manage your earnings and withdrawals"
        />
      </Box>

      <Row className="g-4">
        {/* Available Balance - full width */}
        <Col lg={12} md={12}>
          <AvailableBalance />
        </Col>

        {/* Withdrawal Form and Payment Account side-by-side */}
        <Col lg={6} md={12}>
          <WithdrawalForm user={user} isInfoEnough={isInfoEnough} />
        </Col>

        <Col lg={6} md={12}>
          <PaymentAccount user={user} isInfoEnough={isInfoEnough} />
        </Col>

        {/* Withdrawal History full width */}
        <Col lg={12} md={12}>
          <WithdrawalHistory />
        </Col>
      </Row>
    </MainCard>
  );
}

export default RevenuePage;
