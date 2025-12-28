"use client"
import { Link } from "react-router-dom"
import { Edit, Save, X, MapPin } from "lucide-react"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"

export default function Overview(props) {
  const {
    profileData,
    isEditing,
    setIsEditing,
    handleSaveProfile,
    handleCancelEdit,
    showAddressForm,
    setShowAddressForm,
    editingAddress,
    setEditingAddress,
    handleSaveAddress,
    handleDeleteAddress,
    isOwner,
    isRenter,
    ownerItems,
    itemsLoading,
    formatDate,
    getStatusColor,
    getPaymentStatusColor,
    formatPrice,
  } = props

  const NEPAL_DISTRICTS = [
    "Achham",
"Arghakhanchi",
"Baglung",
"Bajhang",
"Bajura",
"Banke",
"Bara",
"Bardiya",
"Bhaktapur",
"Bhanu (Tanahun)",
"Bhojpur",
"Chitwan",
"Dadeldhura",
"Dailekh",
"Darchula",
"Dang",
"Dhading",
"Dhanusa",
"Dhankuta",
"Dholpa",
"Dolakha",
"Doti",
"Gorkha",
"Gulmi",
"Humla",
"Ilam",
"Jajarkot",
"Jhapa",
"Jumla",
"Kailali",
"Kalikot",
"Kanchanpur",
"Kapilvastu",
"Kathmandu",
"Kavrepalanchok",
"Khotang",
"Lalitpur",
"Lamjung",
"Mahottari",
"Makwanpur",
"Manang",
"Morang",
"Mugu",
"Mustang",
"Myagdi",
"Nuwakot",
"Okhaldhunga",
"Palpa",
"Panchthar",
"Parasi (Nawalparasi West)",
"Parsa",
"Pokhara (Kaski)",
"Pyuthan",
"Rasuwa",
"Rautahat",
"Rolpa",
"Rukum",
"Rupandehi",
"Salyan",
"Salyan (Mid-West)",
"Sankhuwasabha",
"Saptari",
"Siraha",
"Sindhupalchok",
"Solukhumbu",
"Sunsari",
"Tanahun (Bhanu)",
"Taplejung",
"Terhathum",
"Udayapur",
  ]

  return (
    <div className="space-y-6">
      {/* Profile Information Card */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-[#d4af37] p-8 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-6 pb-6 border-b-2 border-[#d4af37]">
          <h2 className="text-3xl font-bold text-[#d4af37]">Profile Information</h2>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-[#d4af37] text-white hover:bg-[#c49a2d] shadow-md font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleSaveProfile}
                size="sm"
                className="bg-[#d4af37] text-white hover:bg-[#c49a2d] font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button
                onClick={handleCancelEdit}
                variant="outline"
                size="sm"
                className="border-2 border-[#d4af37] text-[#d4af37] hover:bg-[#fff2c6] bg-transparent font-semibold transition-all duration-200 hover:scale-105"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="group">
            <label className="block text-sm font-bold text-[#d4af37] mb-3 group-hover:text-[#c49a2d] transition-colors duration-200">
              Full Name
            </label>
            <Input
              name="profile-name"
              value={profileData.name}
              onChange={(e) =>
                props.setProfileData({
                  ...profileData,
                  name: e.target.value,
                })
              }
              disabled={!isEditing}
              autoComplete="off"
              className={`transition-all duration-200 rounded-lg font-medium ${
                !isEditing
                  ? "bg-[#f5e6d3] border-2 border-[#fff2c6] text-gray-700 cursor-not-allowed"
                  : "border-2 border-[#d4af37] focus:border-[#c49a2d] bg-white focus:bg-[#fffef0] shadow-md focus:shadow-lg"
              }`}
            />
          </div>
          <div className="group">
            <label className="block text-sm font-bold text-[#d4af37] mb-3 group-hover:text-[#c49a2d] transition-colors duration-200">
              Email Address
            </label>
            <Input
              name="profile-email"
              value={profileData.email}
              onChange={(e) => props.setProfileData({ ...profileData, email: e.target.value })}
              disabled={!isEditing}
              autoComplete="off"
              className={`transition-all duration-200 rounded-lg font-medium ${
                !isEditing
                  ? "bg-[#f5e6d3] border-2 border-[#fff2c6] text-gray-700 cursor-not-allowed"
                  : "border-2 border-[#d4af37] focus:border-[#c49a2d] bg-white focus:bg-[#fffef0] shadow-md focus:shadow-lg"
              }`}
            />
          </div>
          <div className="group">
            <label className="block text-sm font-bold text-[#d4af37] mb-3 group-hover:text-[#c49a2d] transition-colors duration-200">
              Phone Number
            </label>
            <Input
              name="profile-phone"
              value={profileData.phone}
              maxLength={10}
              onChange={(e) => {
                if (/^\d*$/.test(e.target.value)) {
                  props.setProfileData({ ...profileData, phone: e.target.value })
                }
              }}
              disabled={!isEditing}
              autoComplete="off"
              className={`transition-all duration-200 rounded-lg font-medium ${
                !isEditing
                  ? "bg-[#f5e6d3] border-2 border-[#fff2c6] text-gray-700 cursor-not-allowed"
                  : "border-2 border-[#d4af37] focus:border-[#c49a2d] bg-white focus:bg-[#fffef0] shadow-md focus:shadow-lg"
              }`}
            />
          </div>
        </div>

        <div className="pt-6 border-t-2 border-[#d4af37]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-[#d4af37] flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#d4af37]" />
              Address
            </h3>
            {isEditing && (
              <Button
                onClick={() => {
                  setShowAddressForm(true)
                  setEditingAddress({ ...(profileData.address || {}), country: (profileData.address && profileData.address.country) ? profileData.address.country : 'Nepal' })
                }}
                className="bg-[#d4af37] text-white hover:bg-[#c49a2d] font-semibold text-sm border border-[#d4af37] rounded-lg px-4 py-2 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                {profileData.address && Object.keys(profileData.address).length ? "Edit Address" : "+ Add Address"}
              </Button>
            )}
          </div>

          {profileData.address && Object.keys(profileData.address).length ? (
            <div className="mt-4">
              <div className="bg-[#f5e6d3] rounded-lg p-4 border border-[#fff2c6] hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold text-[#d4af37]">
                    {profileData.address.name || profileData.address.type || "Address"}
                  </p>
                  {isEditing && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingAddress({ ...(profileData.address || {}), country: (profileData.address && profileData.address.country) ? profileData.address.country : 'Nepal' })
                          setShowAddressForm(true)
                        }}
                        className="text-[#d4af37] hover:text-[#c49a2d] text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAddress()}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-700">
                  <p className="font-medium">{profileData.address.country || 'Nepal'}</p>
                  {profileData.address.state && <p>{profileData.address.state}</p>}
                  {profileData.address.district && <p>{profileData.address.district}</p>}
                  {profileData.address.city && <p>{profileData.address.city}</p>}
                  {profileData.address.street && <p>{profileData.address.street}</p>}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm py-4">No address saved yet.</p>
          )}

          {showAddressForm && (
            <div className="mt-4 bg-white rounded-xl p-6 border-2 border-[#d4af37] shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h4 className="text-lg font-bold text-[#d4af37] mb-4">
                {editingAddress && Object.keys(editingAddress).length ? "Edit Address" : "Add Address"}
              </h4>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSaveAddress()
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-sm font-bold text-[#d4af37] mb-2 group-hover:text-[#c49a2d] transition-colors duration-200">
                      Country
                    </label>
                    <Input
                      value={editingAddress.country || "Nepal"}
                      readOnly
                      disabled
                      className="border-2 border-[#d4af37] bg-[#f5f5f5] rounded-lg font-medium text-gray-700"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-bold text-[#d4af37] mb-2 group-hover:text-[#c49a2d] transition-colors duration-200">
                      State / Province
                    </label>
                    <select
                      value={editingAddress.state || ""}
                      onChange={(e) => setEditingAddress({ ...editingAddress, state: e.target.value })}
                      required
                      className="w-full border-2 border-[#d4af37] focus:border-[#c49a2d] bg-white focus:bg-[#fffef0] rounded-lg font-medium shadow-md focus:shadow-lg transition-all duration-200 px-3 py-2"
                    >
                      <option value="">Select State</option>
                      <option value="Province No. 1">Province No. 1 (Koshi)</option>
                      <option value="Madhesh">Madhesh Province</option>
                      <option value="Bagmati">Bagmati Province</option>
                      <option value="Gandaki">Gandaki Province</option>
                      <option value="Lumbini">Lumbini Province</option>
                      <option value="Karnali">Karnali Province</option>
                      <option value="Sudurpashchim">Sudurpashchim Province</option>
                    </select>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-bold text-[#d4af37] mb-2 group-hover:text-[#c49a2d] transition-colors duration-200">
                    District
                  </label>
                  <select
                    value={editingAddress.district || ""}
                    onChange={(e) => setEditingAddress({ ...editingAddress, district: e.target.value })}
                    required
                    className="w-full border-2 border-[#d4af37] focus:border-[#c49a2d] bg-white focus:bg-[#fffef0] rounded-lg font-medium shadow-md focus:shadow-lg transition-all duration-200 px-3 py-2"
                  >
                    <option value="">Select District</option>
                    {NEPAL_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-sm font-bold text-[#d4af37] mb-2 group-hover:text-[#c49a2d] transition-colors duration-200">
                      Street
                    </label>
                    <Input
                      value={editingAddress.street || ""}
                      onChange={(e) => setEditingAddress({ ...editingAddress, street: e.target.value })}
                      placeholder="Street address"
                      required
                      className="border-2 border-[#d4af37] focus:border-[#c49a2d] bg-white focus:bg-[#fffef0] rounded-lg font-medium shadow-md focus:shadow-lg transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-4 border-t-2 border-[#fff2c6]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddressForm(false)
                      setEditingAddress({})
                    }}
                    className="border-2 border-[#d4af37] text-[#d4af37] hover:bg-[#fff2c6] bg-transparent font-semibold transition-all duration-200 hover:scale-105"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#d4af37] text-white hover:bg-[#c49a2d] font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                  >
                    Save Address
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      
    </div>
  )
}
