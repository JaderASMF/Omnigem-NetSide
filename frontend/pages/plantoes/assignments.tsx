import type { GetServerSideProps } from 'next'

export default function AssignmentsPage() { return null }

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: { destination: '/plantoes?tab=assignments', permanent: false },
})
